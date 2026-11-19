import { Env, isValidProduct, ProductRelease, SupportedProduct, SUPPORTED_DOWNLOAD_PRODUCTS } from '../types';
import { GitHubDownloadProvider, GitHubReleaseProvider } from '../github';
import { recordDownloadAnalytics } from '../analytics';
import { getSessionUser, getUserDownloadHistory, recordUserDownloadHistory } from '../auth';
import { json } from '../reliability';

const RELEASE_CACHE = 'public, max-age=300, s-maxage=600';

/** GET /api/releases and /api/releases/:product: GitHub releases of the download page. */
async function releaseListing(env: Env, url: URL): Promise<Response | null> {
  try {
    const provider = new GitHubReleaseProvider(env);
    const includePrereleases = url.searchParams.get('includePrereleases') === 'true';
    const segments = url.pathname.split('/').filter(Boolean);

    if (segments.length === 2) {
      const results = await Promise.allSettled(SUPPORTED_DOWNLOAD_PRODUCTS.map(product => provider.getProductReleases(product, includePrereleases)));
      const releases = {} as Record<SupportedProduct, ProductRelease[]>;
      const errors: Partial<Record<SupportedProduct, string>> = {};
      results.forEach((result, index) => {
        const product = SUPPORTED_DOWNLOAD_PRODUCTS[index];
        releases[product] = result.status === 'fulfilled' ? result.value : [];
        if (result.status === 'rejected') errors[product] = 'Release service unavailable. Please retry.';
      });
      const failed = Object.keys(errors).length;
      return Response.json({ success: failed < results.length, releases, errors, updatedAt: new Date().toISOString() }, {
        status: failed === results.length ? 503 : 200,
        headers: { 'Cache-Control': failed ? 'no-store' : RELEASE_CACHE },
      });
    }

    if (segments.length === 3) {
      const product = segments[2].toLowerCase();
      if (!isValidProduct(product)) {
        return json({ error: `Invalid product: '${product}'. Must be one of visionstudio, visionruntime, visionedge.` }, 400);
      }
      const releases = await provider.getProductReleases(product, includePrereleases);
      return Response.json({ success: true, product, releases, updatedAt: new Date().toISOString() },
                           { headers: { 'Cache-Control': RELEASE_CACHE } });
    }
  } catch (err) {
    console.error('[API Releases Error]:', err);
    return json({ error: 'Unable to retrieve release metadata at this time.' }, 500);
  }
  return null;
}

/** GET /api/download/:product/:assetId: streams a release asset and records the download. */
async function downloadAsset(request: Request, env: Env, url: URL, ctx: ExecutionContext): Promise<Response> {
  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length !== 4) return json({ error: 'Invalid download endpoint format. Expected /api/download/:product/:assetId' }, 400);
  const product = segments[2].toLowerCase();
  const assetId = segments[3];
  if (!isValidProduct(product)) return json({ error: 'Invalid download product' }, 400);
  if (!/^\d+$/.test(assetId)) return json({ error: 'Invalid asset ID' }, 400);

  const result = await new GitHubDownloadProvider(env).getDownloadStream(product, assetId);
  if (!result) {
    await recordDownloadAnalytics(env, request, {
      product, version: 'unknown', assetName: `asset-${assetId}`, statusCode: 404, status: 'not_found',
    }, ctx);
    return json({ error: 'Release asset not found or download authorization unavailable.', code: 'NOT_FOUND' }, 404);
  }

  // Signed-in visitors see the download in their history; recorded without delaying the stream.
  const session = await getSessionUser(env, request.headers.get('Cookie'));
  if (session) {
    const recorded = recordUserDownloadHistory(env, session.id, product, result.version || 'unknown', result.filename);
    if (typeof ctx?.waitUntil === 'function') ctx.waitUntil(recorded);
  }

  // Privacy-preserving analytics: HMAC hash, no raw IP.
  recordDownloadAnalytics(env, request, {
    product, version: result.version || 'unknown', assetName: result.filename, platform: result.platform,
    arch: result.arch, assetSize: result.size, statusCode: 200, status: 'success',
  }, ctx);

  const headers = new Headers();
  const safeFilename = result.filename.replace(/[\x00-\x1f\x7f"\\]/g, '_').replace(/[^\x20-\x7e]/g, '_');
  const encodedFilename = encodeURIComponent(result.filename).replace(/['()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
  headers.set('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`);
  headers.set('Content-Type', result.contentType || 'application/octet-stream');
  if (result.size) headers.set('Content-Length', String(result.size));
  headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(result.stream, { status: 200, headers });
}

/** GitHub release listing, the download proxy and the signed-in user's download history. */
export async function handleDownloadApi(request: Request, env: Env, url: URL, ctx: ExecutionContext): Promise<Response | null> {
  if (request.method !== 'GET') return null;
  if (url.pathname.startsWith('/api/releases')) return releaseListing(env, url);
  if (url.pathname.startsWith('/api/download/')) return downloadAsset(request, env, url, ctx);
  if (url.pathname === '/api/user/downloads') {
    const user = await getSessionUser(env, request.headers.get('Cookie'));
    if (!user) return json({ error: 'Unauthorized' }, 401);
    return json({ success: true, downloads: await getUserDownloadHistory(env, user.id) });
  }
  return null;
}
