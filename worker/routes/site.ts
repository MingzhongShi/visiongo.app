import type { Env } from '../types';
import { allowRequest, json } from '../reliability';
import { isPublicPath, localizedPath, stripLocalePath } from '../../shared/routing';

const BROWSER_WRITE_PREFIXES = ['/api/auth/email/', '/api/orgs/', '/api/admin/', '/api/account/'];
const STATIC_ASSET = /\.(svg|png|jpg|jpeg|gif|ico|webp|woff|woff2|ttf|css|js|map|json|txt|xml)$/i;
const APP_PAGES = new Set(['/my', '/account', '/auth/desktop']);

/** Browser writes must originate from this site and are rate limited; desktop token contracts are unchanged. */
export async function guardBrowserWrite(request: Request, env: Env, url: URL): Promise<Response | null> {
  const path = url.pathname;
  if (request.method !== 'POST' || !(path === '/api/contact' || path === '/api/orgs' || BROWSER_WRITE_PREFIXES.some(prefix => path.startsWith(prefix)))) return null;
  const origin = request.headers.get('Origin');
  if (origin && origin !== url.origin) return json({ error: 'Invalid request origin.' }, 403);
  const address = request.headers.get('CF-Connecting-IP');
  if (address && !await allowRequest(env, 'website-write', address, 30, 600)) return json({ error: 'Too many requests. Please retry later.' }, 429);
  return null;
}

/** Canonical host and protocol, /index.html and trailing slashes (301). */
export function canonicalRedirect(request: Request, env: Env, url: URL): Response | null {
  const hostname = url.hostname.toLowerCase();
  const forwardedProto = request.headers.get('x-forwarded-proto') || (url.protocol ? url.protocol.replace(':', '') : 'https');
  // Each edition redirects www and plain HTTP to its configured canonical origin.
  if (env.PUBLIC_ORIGIN) {
    const canonical = new URL(env.PUBLIC_ORIGIN);
    if (hostname === `www.${canonical.hostname}` || (hostname === canonical.hostname && forwardedProto !== canonical.protocol.slice(0, -1))) {
      return Response.redirect(new URL(`${url.pathname}${url.search}`, canonical.origin).toString(), 301);
    }
  }
  // Internal worker/SPA fetches of /index.html are served as they are.
  if (url.pathname === '/index.html' && !request.headers.get('x-internal-spa')) {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = '/';
    return Response.redirect(redirectUrl.toString(), 301);
  }
  // /downloads/ -> /downloads (pages only).
  if (url.pathname.length > 1 && url.pathname.endsWith('/') && !url.pathname.startsWith('/api/')
      && (request.method === 'GET' || request.method === 'HEAD')) {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = url.pathname.slice(0, -1);
    return Response.redirect(redirectUrl.toString(), 301);
  }
  return null;
}

/** Language the visitor picked with the language switcher (cookie `visiongo_locale`), if any. */
function savedLocale(request: Request): 'en' | 'zh' | null {
  const value = request.headers.get('Cookie')?.split(';').map(item => item.trim()).find(item => item.startsWith('visiongo_locale='))?.slice(16);
  return value === 'en' || value === 'zh' ? value : null;
}

/** Sends visitors without a saved choice from an English URL to the Chinese one when the edition defaults to Chinese. */
function defaultLocaleRedirect(request: Request, env: Env, url: URL): Response | null {
  if (env.DEFAULT_LOCALE !== 'zh' || savedLocale(request) || url.searchParams.has('lang')) return null;
  if (url.pathname === '/zh' || url.pathname.startsWith('/zh/')) return null;
  return new Response(null, { status: 302, headers: {
    Location: new URL(localizedPath(`${url.pathname}${url.search}`, 'zh'), url.origin).toString(),
    'Cache-Control': 'no-store', Vary: 'Cookie' } });
}

/** Security headers of every HTML answer. */
function htmlHeaders(source: Headers, notFound = false): Headers {
  const headers = new Headers(source);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Content-Type', 'text/html; charset=utf-8');
  if (notFound) {
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    headers.set('Cache-Control', 'no-store');
  } else {
    headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  }
  return headers;
}

async function textAsset(request: Request, env: Env, contentType: string, fallback: () => Response): Promise<Response> {
  const asset = await env.ASSETS.fetch(request);
  if (asset.status >= 400) return fallback();
  const headers = new Headers(asset.headers);
  headers.set('Content-Type', contentType);
  headers.set('Cache-Control', 'public, max-age=3600');
  return new Response(asset.body, { status: 200, headers });
}

/** Everything outside /api: robots, sitemap, static assets, prerendered pages, the account app and 404. */
export async function serveSite(request: Request, env: Env, url: URL): Promise<Response> {
  if (url.pathname === '/robots.txt') {
    return textAsset(request, env, 'text/plain; charset=utf-8', () => new Response(`User-agent: *\nAllow: /\nSitemap: ${url.origin}/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }));
  }
  if (url.pathname === '/sitemap.xml') {
    return textAsset(request, env, 'application/xml; charset=utf-8', () => new Response('Not Found', { status: 404 }));
  }

  if (url.pathname.startsWith('/assets/') || STATIC_ASSET.test(url.pathname)) {
    const asset = await env.ASSETS.fetch(request);
    if (asset.status >= 400 || (url.pathname.startsWith('/assets/') && asset.headers.get('Content-Type')?.includes('text/html'))) {
      return new Response('Asset Not Found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
    }
    return asset;
  }

  // Public routes and download deep links share the route registry of the prerender.
  if (isPublicPath(url.pathname)) {
    if (url.searchParams.get('lang') === 'zh') {
      return Response.redirect(new URL(localizedPath(`${url.pathname}${url.search}`, 'zh'), url.origin).toString(), 301);
    }
    const redirect = defaultLocaleRedirect(request, env, url);
    if (redirect) return redirect;
    const locale = url.pathname === '/zh' || url.pathname.startsWith('/zh/') ? 'zh' : 'en';
    const plain = stripLocalePath(url.pathname);
    const snapshot = localizedPath(plain.startsWith('/downloads/') ? '/downloads' : plain, locale);
    const page = await env.ASSETS.fetch(new Request(new URL(snapshot === '/' ? '/home.html' : `${snapshot}.html`, request.url)));
    if (page.status !== 200) return json({ error: 'Page snapshot unavailable.' }, 503);
    const headers = htmlHeaders(page.headers);
    headers.delete('location');
    return new Response(page.body, { status: 200, headers });
  }

  // Signed-in application pages are never cached or indexed.
  if (APP_PAGES.has(url.pathname)) {
    const redirect = defaultLocaleRedirect(request, env, url);
    if (redirect) return redirect;
    const page = await env.ASSETS.fetch(new Request(new URL(`${url.pathname}.html`, request.url)));
    if (page.status !== 200) return json({ error: 'Account page unavailable.' }, 503);
    const headers = htmlHeaders(page.headers);
    headers.delete('location');
    headers.set('Cache-Control', 'no-store');
    headers.set('X-Robots-Tag', 'noindex, follow');
    return new Response(page.body, { status: 200, headers });
  }

  // Unknown route: the 404 page with a real 404 status.
  const notFound = await env.ASSETS.fetch(new Request(new URL('/404.html', request.url), request));
  return new Response(notFound.body, { status: 404, statusText: 'Not Found', headers: htmlHeaders(notFound.headers, true) });
}
