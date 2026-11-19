import type { Env } from '../types';
import { desktopTokenKeySet } from '../auth';

/** GET /api/health and the public keys of the desktop tokens (/.well-known/jwks.json). */
export async function handleHealthApi(request: Request, env: Env, url: URL): Promise<Response | null> {
  if (url.pathname === '/api/health') {
    const cf = (request as unknown as { cf?: { colo?: string } }).cf;
    return Response.json({
      status: 'healthy',
      service: 'VISIONGO Edge Platform',
      timestamp: new Date().toISOString(),
      edgeRegion: cf?.colo || 'local',
      analyticsConfigured: Boolean(env.DOWNLOADS_ANALYTICS),
      d1Configured: Boolean(env.DB),
    }, { headers: { 'Cache-Control': 'no-store' } });
  }

  // Current and still trusted keys; VisionCloud reads them.
  if (url.pathname === '/.well-known/jwks.json' && request.method === 'GET') {
    return Response.json(await desktopTokenKeySet(env), { headers: { 'Cache-Control': 'public, max-age=300',
                                                                      'Access-Control-Allow-Origin': '*' } });
  }
  return null;
}
