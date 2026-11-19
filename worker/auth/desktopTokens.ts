import { Env, TenantSummary, User } from '../types';
import { base64Url, signHmacSha256, verifyHmacSha256 } from './signing';

export interface DesktopAccessToken {
  accessToken: string;
  expiresIn: number;
  tenantId: string;
}

// Every service that accepts the desktop token; each one requires its own name.
const DESKTOP_TOKEN_AUDIENCE = ['visioncloud', 'visionweb'];
const DESKTOP_TOKEN_LIFETIME_SECONDS = 10 * 60;

function pemToBytes(pem: string): Uint8Array {
  const normalized = pem.replace(/\\n/g, '\n');
  const body = normalized
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  if (!body) throw new Error('DESKTOP_TOKEN_PRIVATE_KEY is empty or invalid');
  const binary = atob(body);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

/**
 * Create a short-lived RS256 desktop token for the selected organization.
 * Claims follow SDK IdentityAccessTokenClaims: tenant_id is the organization
 * and role the effective role in it (super_admin stays platform-wide).
 */
export async function createDesktopAccessToken(env: Env, user: User, tenant: TenantSummary,
                                               aiDataAuthorized = false): Promise<DesktopAccessToken> {
  if (!env.DESKTOP_TOKEN_PRIVATE_KEY) {
    throw new Error('DESKTOP_TOKEN_PRIVATE_KEY is not configured');
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = DESKTOP_TOKEN_LIFETIME_SECONDS;
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: env.DESKTOP_TOKEN_KEY_ID || 'website-desktop-1',
  };
  const payload = {
    iss: env.DESKTOP_TOKEN_ISSUER || 'https://visiongo.app',
    aud: DESKTOP_TOKEN_AUDIENCE,
    sub: user.id,
    tenant_id: tenant.tenant_id,
    role: user.role === 'super_admin' ? 'super_admin' : tenant.role,
    tenant_name: tenant.name,
    tenant_type: tenant.type,
    username: user.displayName || user.email.split('@')[0],
    email: user.email,
    iat: now,
    exp: now + expiresIn,
    jti: crypto.randomUUID(),
    // The organization's data authorization for VisionCloud AI (identity 2).
    ai_data_authorized: aiDataAuthorized,
  };
  const encoder = new TextEncoder();
  const encodedHeader = base64Url(encoder.encode(JSON.stringify(header)));
  const encodedPayload = base64Url(encoder.encode(JSON.stringify(payload)));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToBytes(env.DESKTOP_TOKEN_PRIVATE_KEY),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    encoder.encode(signingInput)
  );
  return {
    accessToken: `${signingInput}.${base64Url(new Uint8Array(signature))}`,
    expiresIn,
    tenantId: tenant.tenant_id,
  };
}

/**
 * The desktop token key set (RFC 7517) for /.well-known/jwks.json: the public
 * half of the current signing key under DESKTOP_TOKEN_KEY_ID, then the earlier
 * keys of DESKTOP_TOKEN_PUBLIC_KEYS. Malformed earlier keys are left out.
 */
export async function desktopTokenKeySet(env: Env): Promise<{ keys: Record<string, string>[] }> {
  const keys: Record<string, string>[] = [];
  if (env.DESKTOP_TOKEN_PRIVATE_KEY) {
    const privateKey = await crypto.subtle.importKey('pkcs8', pemToBytes(env.DESKTOP_TOKEN_PRIVATE_KEY),
                                                     { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, true, ['sign']);
    const jwk = await crypto.subtle.exportKey('jwk', privateKey) as JsonWebKey;
    if (jwk.n && jwk.e) {
      keys.push({ kty: 'RSA', kid: env.DESKTOP_TOKEN_KEY_ID || 'website-desktop-1', use: 'sig', alg: 'RS256',
                  n: jwk.n, e: jwk.e });
    }
  }
  let earlier: unknown = [];
  try {
    earlier = JSON.parse(env.DESKTOP_TOKEN_PUBLIC_KEYS || '[]');
  } catch {
    console.error('[JWKS] DESKTOP_TOKEN_PUBLIC_KEYS is not JSON');
  }
  for (const item of Array.isArray(earlier) ? earlier : []) {
    const key = item as Record<string, unknown>;
    if (key && key.kty === 'RSA' && typeof key.kid === 'string' && typeof key.n === 'string' && typeof key.e === 'string'
        && !keys.some(existing => existing.kid === key.kid)) {
      keys.push({ kty: 'RSA', kid: key.kid, use: 'sig', alg: 'RS256', n: key.n, e: key.e });
    }
  }
  return { keys };
}

// =========================================================================
// OAuth 2.0 PKCE & Refresh Token Utilities for Desktop Client
// =========================================================================

export interface DesktopAuthCodePayload {
  type: 'desktop_auth_code';
  userId: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256' | 'plain';
  /** Organization chosen on the authorization page; absent for older pages. */
  tenantId?: string;
  exp: number; // Unix ms
  jti: string;
}

export const DESKTOP_REFRESH_TOKEN_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface DesktopRefreshTokenPayload {
  type: 'desktop_refresh_token';
  userId: string;
  /** Organization the session is bound to; absent in tokens issued before organizations. */
  tenantId?: string;
  exp: number; // Unix ms
  jti: string;
}

export async function createDesktopAuthCode(
  user: User,
  codeChallenge: string,
  codeChallengeMethod: 'S256' | 'plain' = 'S256',
  secretKey?: string,
  tenantId?: string
): Promise<string> {
  if (!secretKey) throw new Error('SESSION_SECRET is not configured');
  const payload: DesktopAuthCodePayload = {
    type: 'desktop_auth_code',
    userId: user.id,
    codeChallenge,
    codeChallengeMethod,
    tenantId,
    exp: Date.now() + 5 * 60 * 1000, // 5 minutes lifetime
    jti: crypto.randomUUID(),
  };

  const signed = await signHmacSha256(JSON.stringify(payload), secretKey);
  return `vg_ac_${signed}`;
}

export async function verifyDesktopAuthCode(
  code: string,
  secretKey?: string
): Promise<DesktopAuthCodePayload | null> {
  if (!secretKey || !code || !code.startsWith('vg_ac_')) return null;
  const tokenBody = code.slice('vg_ac_'.length);
  const jsonStr = await verifyHmacSha256(tokenBody, secretKey);
  if (!jsonStr) return null;

  try {
    const payload = JSON.parse(jsonStr) as DesktopAuthCodePayload;
    if (payload.type !== 'desktop_auth_code') return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function verifyPkceChallenge(
  codeVerifier: string,
  codeChallenge: string,
  method: 'S256' | 'plain' = 'S256'
): Promise<boolean> {
  if (!codeVerifier || !codeChallenge) return false;
  if (method === 'plain') {
    return codeVerifier === codeChallenge;
  }
  if (method === 'S256') {
    const encoder = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', encoder.encode(codeVerifier));
    const calculatedChallenge = base64Url(new Uint8Array(hash));
    return calculatedChallenge === codeChallenge;
  }
  return false;
}

/** Signs a refresh token; desktopSessions.ts records it (a token without its row is refused). */
export async function createDesktopRefreshToken(
  user: Pick<User, 'id'>,
  secretKey: string | undefined,
  tenantId: string,
  jti: string = crypto.randomUUID(),
  exp: number = Date.now() + DESKTOP_REFRESH_TOKEN_LIFETIME_MS
): Promise<string> {
  if (!secretKey) throw new Error('SESSION_SECRET is not configured');
  const payload: DesktopRefreshTokenPayload = {
    type: 'desktop_refresh_token',
    userId: user.id,
    tenantId,
    exp,
    jti,
  };

  const signed = await signHmacSha256(JSON.stringify(payload), secretKey);
  return `vg_rf_${signed}`;
}

export async function verifyDesktopRefreshToken(
  refreshToken: string,
  secretKey?: string
): Promise<DesktopRefreshTokenPayload | null> {
  if (!secretKey || !refreshToken || !refreshToken.startsWith('vg_rf_')) return null;
  const tokenBody = refreshToken.slice('vg_rf_'.length);
  const jsonStr = await verifyHmacSha256(tokenBody, secretKey);
  if (!jsonStr) return null;

  try {
    const payload = JSON.parse(jsonStr) as DesktopRefreshTokenPayload;
    if (payload.type !== 'desktop_refresh_token') return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
