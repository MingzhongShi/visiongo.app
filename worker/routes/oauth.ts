import type { Env } from '../types';
import { createSessionCookie, getOrCreateGitHubUser, getOrCreateUser, verifyGoogleIdToken } from '../auth';
import { methodDisabledResponse, methodEnabled } from '../authMethods';
import { clearGitHubStateCookie, consumeGitHubOAuth, safeReturnPath, startGitHubOAuth } from '../githubOAuth';
import { json } from '../reliability';
import { signedIn } from './session';

/** Browser-bound, expiring, one-use GitHub OAuth state with PKCE. */
async function startGitHub(env: Env, url: URL): Promise<Response> {
  const returnPath = safeReturnPath(url.searchParams.get('returnUrl'));
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.DB || !env.SESSION_SECRET) {
    const redirect = new URL(returnPath, url.origin);
    redirect.searchParams.set('auth_notice', 'github_not_configured');
    return Response.redirect(redirect.toString(), 302);
  }
  const flow = await startGitHubOAuth(env, returnPath);
  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.search = new URLSearchParams({ client_id: env.GITHUB_CLIENT_ID, scope: 'user:email',
    redirect_uri: `${url.origin}/api/auth/github/callback`, state: flow.state,
    code_challenge: flow.challenge, code_challenge_method: 'S256' }).toString();
  return new Response(null, { status: 302, headers: { Location: authorize.toString(), 'Set-Cookie': flow.cookie, 'Cache-Control': 'no-store' } });
}

async function finishGitHub(request: Request, env: Env, url: URL): Promise<Response> {
  const redirect = (path: string, error?: string, sessionCookie?: string) => {
    const destination = new URL(safeReturnPath(path), url.origin);
    if (error) destination.searchParams.set('auth_error', error);
    const headers = new Headers({ Location: destination.toString(), 'Cache-Control': 'no-store' });
    headers.append('Set-Cookie', clearGitHubStateCookie);
    if (sessionCookie) headers.append('Set-Cookie', sessionCookie);
    return new Response(null, { status: 302, headers });
  };
  let returnPath = '/my';
  try {
    const flow = await consumeGitHubOAuth(env, url.searchParams.get('state'), request.headers.get('Cookie'));
    if (!flow) return redirect('/my', 'github_invalid_state');
    returnPath = flow.return_path;
    const code = url.searchParams.get('code');
    if (!code) return redirect(returnPath, 'github_cancelled');
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET,
        redirect_uri: `${url.origin}/api/auth/github/callback`, code_verifier: flow.code_verifier, code }),
    });
    const token = await tokenRes.json() as { access_token?: string };
    if (!tokenRes.ok || !token.access_token) return redirect(returnPath, 'github_token_failed');
    const headers = { Authorization: `Bearer ${token.access_token}`, 'User-Agent': 'VISIONGO-Website-Auth', Accept: 'application/json' };
    const userRes = await fetch('https://api.github.com/user', { headers, signal: AbortSignal.timeout(10000) });
    const profile = await userRes.json() as { id: number; login: string; name?: string; avatar_url?: string };
    if (!userRes.ok || !profile.id || !profile.login) return redirect(returnPath, 'github_profile_failed');
    const emailsRes = await fetch('https://api.github.com/user/emails', { headers, signal: AbortSignal.timeout(10000) });
    if (!emailsRes.ok) return redirect(returnPath, 'github_email_failed');
    const emails = await emailsRes.json() as Array<{ email: string; primary: boolean; verified: boolean }>;
    const email = emails.find(item => item.primary && item.verified) || emails.find(item => item.verified);
    if (!email) return redirect(returnPath, 'github_email_failed');
    const user = await getOrCreateGitHubUser(env, { ...profile, email: email.email });
    const session = await createSessionCookie(user.id, user.githubId || user.email, env.SESSION_SECRET, user.sessionVersion || 0);
    return redirect(returnPath, undefined, session.cookieHeader);
  } catch {
    console.error('[GitHub] OAuth callback failed');
    return redirect(returnPath, 'github_server_error');
  }
}

/** Verifies a Google ID token and signs the user in. */
async function googleSignIn(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as { credential?: string };
    if (!body.credential) return json({ error: 'Google credential token is required' }, 400);
    const profile = await verifyGoogleIdToken(body.credential, env.GOOGLE_CLIENT_ID);
    if (!profile) return json({ error: 'Invalid or expired Google credential' }, 401);
    const user = await getOrCreateUser(env, profile);
    const { cookieHeader } = await createSessionCookie(user.id, user.googleSub!, env.SESSION_SECRET, user.sessionVersion || 0);
    return signedIn(user, cookieHeader);
  } catch (err) {
    console.error('[Auth Google Error]:', err);
    return json({ error: 'Authentication failed due to server error' }, 500);
  }
}

/** GitHub and Google sign-in. */
export async function handleOAuthApi(request: Request, env: Env, url: URL): Promise<Response | null> {
  if (url.pathname === '/api/auth/github' && request.method === 'GET') {
    return methodEnabled(env, 'github') ? startGitHub(env, url) : methodDisabledResponse();
  }
  if (url.pathname === '/api/auth/github/callback' && request.method === 'GET') {
    return methodEnabled(env, 'github') ? finishGitHub(request, env, url) : methodDisabledResponse();
  }
  if (url.pathname === '/api/auth/google' && request.method === 'POST') {
    return methodEnabled(env, 'google') ? googleSignIn(request, env) : methodDisabledResponse();
  }
  return null;
}
