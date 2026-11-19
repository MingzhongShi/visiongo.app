// Desktop sign-in endpoints of SDK/schemas/identity.json plus the page flow that mints the code.
import type { Env, User } from '../types';
import { createDesktopAccessToken, createDesktopAuthCode, getSession, getUserById, verifyDesktopAuthCode, verifyPkceChallenge } from '../auth';
import { effectiveRole, rememberTenant, resolveTenant, ResolvedTenant } from '../organizations';
import { deviceName, inspectRefreshToken, issueRefreshToken, revokeWithRefreshToken, rotateRefreshToken } from '../desktopSessions';

const TOKEN_PATHS = new Set(['/api/auth/token', '/api/auth/refresh', '/api/auth/switch-tenant', '/api/auth/revoke']);
const DESKTOP_HEADERS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' };
const NO_STORE_JSON = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

type Body = Record<string, unknown>;
const readBody = async (request: Request) => (await request.json().catch(() => ({}))) as Body;
const text = (value: unknown) => typeof value === 'string' ? value : undefined;

/** SDK IdentityErrorResponse. */
function desktopError(status: number, error: string, description: string): Response {
  return new Response(JSON.stringify({ error, error_description: description }), { status, headers: DESKTOP_HEADERS });
}

function pageAnswer(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: NO_STORE_JSON });
}

/** The configured VisionCloud origin (https only, no path); undefined when unset or malformed. */
function cloudBaseUrl(env: Env): string | undefined {
  if (!env.CLOUD_BASE_URL) return undefined;
  try {
    const url = new URL(env.CLOUD_BASE_URL);
    return url.protocol === 'https:' && (url.pathname === '/' || url.pathname === '') ? url.origin : undefined;
  } catch {
    return undefined;
  }
}

/** SDK IdentityTokenResponse for the resolved organization. */
async function tokenResponse(env: Env, user: User, resolved: ResolvedTenant,
                             options: { refreshToken: string; remember: boolean }): Promise<Response> {
  const token = await createDesktopAccessToken(env, user, resolved.tenant, resolved.aiDataAuthorized);
  const body: Record<string, unknown> = {
    access_token: token.accessToken,
    token_type: 'Bearer',
    expires_in: token.expiresIn,
    tenant_id: token.tenantId,
    // identity 4: every answer carries the refresh token that replaces the presented one.
    refresh_token: options.refreshToken,
  };
  if (options.remember) await rememberTenant(env, user.id, resolved.tenant.tenant_id);
  Object.assign(body, {
    user_id: user.id,
    username: user.displayName || user.email.split('@')[0],
    email: user.email,
    role: effectiveRole(user, resolved.tenant),
    tenant_name: resolved.tenant.name,
    tenant_type: resolved.tenant.type,
    tenants: resolved.tenants,
    ai_data_authorized: resolved.aiDataAuthorized,
  });
  const cloud = cloudBaseUrl(env);
  if (cloud) body.cloud_base_url = cloud;
  return new Response(JSON.stringify(body), { status: 200, headers: DESKTOP_HEADERS });
}

/**
 * POST /api/auth/desktop-code: a 5-minute authorization code for the PKCE flow. The website
 * session cookie authenticates; an optional tenant_id selects the organization to act in.
 */
async function desktopCode(request: Request, env: Env): Promise<Response> {
  const session = await getSession(env, request.headers.get('Cookie'));
  if (!session) return pageAnswer({ error: 'Authenticated user no longer exists' }, 401);
  const user = session.user;
  try {
    const body = await readBody(request);
    // Seconds since sign-in the session may be (the client asked for prompt=login).
    if (typeof body.max_age === 'number' && Date.now() - session.signedInAt > Math.max(0, body.max_age) * 1000) {
      return pageAnswer({ error: 'login_required', error_description: 'Sign in again to authorize this client' }, 401);
    }
    const challenge = body.code_challenge;
    if (!challenge) return pageAnswer({ error: 'code_challenge is required' }, 400);
    let tenantId: string | undefined;
    if (body.tenant_id) {
      const resolved = await resolveTenant(env, user, body.tenant_id as string);
      if (!resolved) return pageAnswer({ error: 'You are not an active member of this organization' }, 403);
      tenantId = resolved.tenant.tenant_id;
    }
    const method = body.code_challenge_method === 'plain' ? 'plain' : 'S256';
    const code = await createDesktopAuthCode(user, challenge as string, method, env.SESSION_SECRET, tenantId);
    return pageAnswer({ code, expires_in: 300 }, 200);
  } catch (err) {
    console.error('[Desktop Code Error]:', err);
    return pageAnswer({ error: 'Failed to create authorization code' }, 500);
  }
}

/** POST /api/auth/token: authorization code + code_verifier (SDK identity Token). */
async function exchangeCode(body: Body, env: Env): Promise<Response> {
  const code = text(body.code), verifier = text(body.code_verifier);
  if (body.grant_type !== 'authorization_code' || !code || !verifier) {
    return desktopError(400, 'invalid_request', 'grant_type=authorization_code, code, and code_verifier are required');
  }
  const authCode = await verifyDesktopAuthCode(code, env.SESSION_SECRET);
  if (!authCode) return desktopError(400, 'invalid_grant', 'Authorization code is invalid or expired');
  if (!await verifyPkceChallenge(verifier, authCode.codeChallenge, authCode.codeChallengeMethod)) {
    return desktopError(400, 'invalid_grant', 'PKCE code_verifier verification failed');
  }
  const user = await getUserById(env, authCode.userId);
  if (!user) return desktopError(400, 'invalid_grant', 'User not found');
  // The organization chosen on the authorization page wins over the client's preference.
  const resolved = await resolveTenant(env, user, authCode.tenantId || text(body.tenant_id));
  if (!resolved) return desktopError(403, 'invalid_tenant', 'The user is not an active member of the requested organization');
  const refreshToken = await issueRefreshToken(env, user, resolved.tenant.tenant_id, deviceName(body.device_name));
  return tokenResponse(env, user, resolved, { refreshToken, remember: true });
}

/**
 * POST /api/auth/refresh (organization of the refresh token) and /api/auth/switch-tenant
 * (another organization). Membership is checked again, so a removed member stops receiving tokens.
 */
async function rotate(body: Body, env: Env, switching: boolean): Promise<Response> {
  const presented = text(body.refresh_token), wanted = text(body.tenant_id);
  if (!presented || (switching && !wanted)) {
    return desktopError(400, 'invalid_request', switching ? 'refresh_token and tenant_id are required' : 'refresh_token is required');
  }
  const inspected = await inspectRefreshToken(env, presented);
  if (!inspected.ok) return desktopError(401, inspected.error, inspected.description);
  const user = await getUserById(env, inspected.payload.userId);
  if (!user) return desktopError(401, 'invalid_grant', 'User not found');
  // Refresh tokens issued before organizations are bound to the personal organization.
  const resolved = await resolveTenant(env, user, switching ? wanted : inspected.payload.tenantId || user.tenantId);
  if (!resolved) {
    return switching
      ? desktopError(403, 'invalid_tenant', 'The user is not an active member of the requested organization')
      : desktopError(403, 'tenant_access_revoked', 'The user is no longer an active member of this organization');
  }
  const refreshToken = await rotateRefreshToken(env, user, inspected, resolved.tenant.tenant_id);
  if (!refreshToken) return desktopError(401, 'invalid_grant', 'Refresh token was used by another request');
  return tokenResponse(env, user, resolved, { refreshToken, remember: switching });
}

/** POST /api/auth/revoke: end this computer's sign-in (scope device) or every desktop sign-in (all). */
async function revoke(body: Body, env: Env): Promise<Response> {
  const presented = text(body.refresh_token);
  if (!presented || (body.scope !== 'device' && body.scope !== 'all')) {
    return desktopError(400, 'invalid_request', 'refresh_token and scope (device or all) are required');
  }
  const revoked = await revokeWithRefreshToken(env, presented, body.scope);
  if (revoked === null) return desktopError(401, 'invalid_grant', 'Refresh token is invalid or expired');
  return new Response(JSON.stringify({ revoked }), { status: 200, headers: DESKTOP_HEADERS });
}

const TOKEN_ENDPOINTS: Record<string, { run: (body: Body, env: Env) => Promise<Response>; log: string; failure: string }> = {
  '/api/auth/token': { run: exchangeCode, log: '[Token Exchange Error]:', failure: 'Failed to exchange authorization code' },
  '/api/auth/refresh': { run: (body, env) => rotate(body, env, false), log: '[Token Refresh Error]:', failure: 'Failed to refresh token' },
  '/api/auth/switch-tenant': { run: (body, env) => rotate(body, env, true), log: '[Switch Tenant Error]:', failure: 'Failed to switch organization' },
  '/api/auth/revoke': { run: revoke, log: '[Revoke Error]:', failure: 'Failed to revoke the sign-in' },
};

/** Desktop authorization code, token, refresh, organization switch and revoke. */
export async function handleDesktopAuthApi(request: Request, env: Env, url: URL): Promise<Response | null> {
  if (TOKEN_PATHS.has(url.pathname) && request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  if (request.method !== 'POST') return null;
  if (url.pathname === '/api/auth/desktop-code') return desktopCode(request, env);
  const endpoint = TOKEN_ENDPOINTS[url.pathname];
  if (!endpoint) return null;
  try {
    return await endpoint.run(await readBody(request), env);
  } catch (err) {
    console.error(endpoint.log, err);
    return desktopError(500, 'server_error', endpoint.failure);
  }
}
