import type { Env, User } from '../types';
import { getSessionUser } from '../auth';
import { authMethods, methodEnabled } from '../authMethods';

/** PORTAL_REDIRECT_URIS as a list of absolute https URLs; anything else is ignored. */
function portalRedirectUris(env: Env): string[] {
  return (env.PORTAL_REDIRECT_URIS || '')
    .split(',')
    .map(item => item.trim())
    .filter(item => {
      try {
        const parsed = new URL(item);
        return parsed.protocol === 'https:' && parsed.href === item && !parsed.search && !parsed.hash;
      } catch {
        return false;
      }
    });
}

/** The user as the website's pages see it. */
export function publicUser(user: User): Record<string, unknown> {
  return { id: user.id, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl, createdAt: user.createdAt };
}

/** Answer of a successful sign-in: the user and the new session cookie. */
export function signedIn(user: User, cookieHeader: string): Response {
  return new Response(JSON.stringify({ success: true, user: publicUser(user) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookieHeader },
  });
}

/** Sign-in configuration, the current user and sign-out of the website session. */
export async function handleSessionApi(request: Request, env: Env, url: URL): Promise<Response | null> {
  if (url.pathname === '/api/auth/config' && request.method === 'GET') {
    return Response.json({
      methods: authMethods(env),
      // False while this edition cannot send email: codes then come from a platform administrator.
      emailDelivery: !!env.RESEND_API_KEY,
      googleClientId: methodEnabled(env, 'google') ? env.GOOGLE_CLIENT_ID || null : null,
      githubClientId: methodEnabled(env, 'github') ? env.GITHUB_CLIENT_ID || null : null,
      // Pages /auth/desktop may return an authorization code to (exact match).
      portalRedirectUris: portalRedirectUris(env),
    }, { headers: { 'Cache-Control': 'public, max-age=60' } });
  }

  if (url.pathname === '/api/auth/me' && request.method === 'GET') {
    const user = await getSessionUser(env, request.headers.get('Cookie'));
    return Response.json({ user: user ? { ...publicUser(user), role: user.role } : null },
                         { headers: { 'Cache-Control': 'no-store' } });
  }

  if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Set-Cookie': 'vg_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0' },
    });
  }
  return null;
}
