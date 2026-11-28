/**
 * VISIONGO website Worker: one entry for both editions (Cloudflare Workers, and Node via deploy/server.mjs).
 *
 * A request passes the browser-write guard and canonical redirects, then the API handlers in
 * order (each answers its own paths and returns null for the rest); unmatched /api/* is a JSON
 * 404 and everything else is served by routes/site.ts.
 */
import type { Env } from './types';
import { json } from './reliability';
import { withErrorCode } from './errorCodes';
import { receiveInquiry, dispatchInquiries, handleAdminInquiriesApi } from './contacts';
import { handleReleaseAdmin, handleReleaseManifest } from './releases';
import { handleAccountApi, handleAdminUsersApi } from './accountAdmin';
import { handleDesktopSessionApi } from './desktopSessions';
import { handleOrganizationApi } from './organizations';
import { handleHealthApi } from './routes/health';
import { handleDownloadApi } from './routes/downloads';
import { handleSessionApi } from './routes/session';
import { handleEmailAuthApi } from './routes/emailAuth';
import { handleOAuthApi } from './routes/oauth';
import { handleDesktopAuthApi } from './routes/desktop';
import { canonicalRedirect, guardBrowserWrite, serveSite } from './routes/site';

type Handler = (request: Request, env: Env, url: URL, ctx: ExecutionContext) => Promise<Response | null>;

const API: Handler[] = [
  handleHealthApi,
  // Release manifests (SDK releases 1) before the GitHub release listing that shares /api/releases.
  handleReleaseManifest,
  handleReleaseAdmin,
  handleDownloadApi,
  async (request, env, url, ctx) => url.pathname === '/api/contact' && request.method === 'POST' ? receiveInquiry(request, env, ctx) : null,
  handleSessionApi,
  handleEmailAuthApi,
  handleOAuthApi,
  handleDesktopAuthApi,
  handleAccountApi,
  handleAdminUsersApi,
  handleAdminInquiriesApi,
  handleDesktopSessionApi,
  handleOrganizationApi,
];

async function handleRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const early = await guardBrowserWrite(request, env, url) ?? canonicalRedirect(request, env, url);
  if (early) return early;
  for (const handler of API) {
    const response = await handler(request, env, url, ctx);
    if (response) return response;
  }
  // Unhandled /api/* never falls through to an HTML page.
  if (url.pathname.startsWith('/api/')) return json({ error: 'API route not found', path: url.pathname }, 404);
  return serveSite(request, env, url);
}

/** Expired one-use records, then queued contact inquiries. */
async function cleanUp(env: Env): Promise<void> {
  const now = Date.now();
  await env.DB!.batch([
    env.DB!.prepare('DELETE FROM github_oauth_states WHERE expires_at <= ?').bind(now),
    env.DB!.prepare('DELETE FROM request_limits WHERE expires_at <= ?').bind(now),
    env.DB!.prepare('DELETE FROM email_verification_codes WHERE expires_at <= ?').bind(now),
  ]);
  await dispatchInquiries(env);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try { return await withErrorCode(await handleRequest(request, env, ctx)); }
    catch { console.error('[Worker] Request failed'); return withErrorCode(json({ error: 'Service temporarily unavailable. Please retry.' }, 503)); }
  },
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    if (!env.DB) return;
    ctx.waitUntil(cleanUp(env));
  },
};
