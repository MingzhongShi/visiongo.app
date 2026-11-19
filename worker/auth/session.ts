import { Env, User } from '../types';
import { getUserById } from './users';

export interface SessionPayload {
  userId: string;
  googleSub?: string;
  authSubject?: string;
  exp: number; // Unix timestamp in ms
  /** When the user signed in for this session (ms); absent in sessions created before it was recorded. */
  iat?: number;
  /** users.session_version when the session was created; absent means 0. */
  sv?: number;
}

/**
 * Creates a signed session cookie string using HMAC-SHA256.
 */
export async function createSessionCookie(
  userId: string,
  authSubject: string,
  secretKey?: string,
  sessionVersion = 0
): Promise<{ cookieHeader: string; sessionPayload: SessionPayload }> {
  if (!secretKey) throw new Error('SESSION_SECRET is not configured');
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const sessionPayload: SessionPayload = { userId, googleSub: authSubject, authSubject, exp, iat: Date.now(), sv: sessionVersion };

  const encoder = new TextEncoder();
  const payloadJson = JSON.stringify(sessionPayload);
  const payloadB64 = btoa(payloadJson).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const keyData = encoder.encode(secretKey);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(payloadB64));
  const sigArray = Array.from(new Uint8Array(sigBuffer));
  const sigB64 = btoa(String.fromCharCode(...sigArray)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const token = `${payloadB64}.${sigB64}`;
  const maxAgeSec = 30 * 24 * 60 * 60;
  const cookieHeader = `vg_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`;

  return { cookieHeader, sessionPayload };
}

/**
 * Verifies and parses a signed session cookie.
 */
export async function verifySessionCookie(
  cookieHeader: string | null,
  secretKey?: string
): Promise<SessionPayload | null> {
  if (!cookieHeader || !secretKey) return null;

  const match = cookieHeader.match(/(?:^|;\s*)vg_session=([^;]+)/);
  if (!match) return null;

  const token = match[1];
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, sigB64] = parts;

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const binarySig = atob(sigB64.replace(/-/g, '+').replace(/_/g, '/'));
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify('HMAC', cryptoKey, sigBytes, encoder.encode(payloadB64));
    if (!isValid) return null;

    const decodedJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(decodedJson) as SessionPayload;

    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * The user of a valid session cookie whose session version is current; null otherwise
 * (no or forged cookie, expired, deleted user, or a password reset since sign-in).
 */
export async function getSessionUser(env: Env, cookieHeader: string | null): Promise<User | null> {
  return (await getSession(env, cookieHeader))?.user ?? null;
}

/** The signed-in user and when they signed in (0 when the session predates that record). */
export async function getSession(env: Env, cookieHeader: string | null): Promise<{ user: User; signedInAt: number } | null> {
  const session = await verifySessionCookie(cookieHeader, env.SESSION_SECRET);
  if (!session) return null;
  const user = await getUserById(env, session.userId);
  if (!user || (session.sv || 0) !== (user.sessionVersion || 0)) return null;
  return { user, signedInAt: session.iat || 0 };
}
