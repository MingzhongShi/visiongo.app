import type { Env } from '../types';
import {
  createSessionCookie, generateVerificationCode, getUserByEmail, loginUserWithEmail, passwordPolicyError,
  registerUserWithEmail, resetPassword, saveVerificationCode, sendVerificationEmail, verifyAndConsumeCode,
  type CodePurpose,
} from '../auth';
import { methodDisabledResponse, methodEnabled } from '../authMethods';
import { revokeUserSessions } from '../desktopSessions';
import { allowRequest, json } from '../reliability';
import { signedIn } from './session';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_SENT = '验证码已发送至您的邮箱，10 分钟内有效';
const TOO_MANY_TRIES = '尝试次数过多，请稍后重试';
const CODE_INVALID = '验证码错误或已过期，请重新获取';

type Body = Record<string, string | undefined>;
const readBody = async (request: Request) => (await request.json().catch(() => ({}))) as Body;
const normalizedEmail = (body: Body) => (body.email || '').trim().toLowerCase();

/** A 6-digit code for sign-up (register) or password reset (reset). */
async function sendCode(request: Request, env: Env): Promise<Response> {
  const body = await readBody(request);
  const email = normalizedEmail(body);
  const purpose: CodePurpose = body.purpose === 'reset' ? 'reset' : 'register';
  if (!email || !EMAIL_PATTERN.test(email) || email.length > 254) return json({ error: '请输入有效的邮箱地址' }, 400);

  if (!await allowRequest(env, 'email-code', email, 1, 60)) return json({ error: '请稍后再申请验证码' }, 429);
  if (!await allowRequest(env, 'email-code-hour', email, 5, 3600)) return json({ error: '验证码申请过于频繁，请一小时后再试' }, 429);
  const address = request.headers.get('CF-Connecting-IP');
  if (address && !await allowRequest(env, 'email-code-ip', address, 20, 3600)) return json({ error: '请求过于频繁，请稍后再试' }, 429);

  // Without email delivery nothing is sent, and a code an administrator issued stays valid.
  if (!env.RESEND_API_KEY) {
    return json({ error: '本站暂未开通邮件发送，请向管理员索取验证码，收到后直接填入下方', code: 'email_not_configured' }, 503);
  }

  const existing = await getUserByEmail(env, email);
  if (purpose === 'register' && existing) return json({ error: '该邮箱已被注册，请直接登录' }, 400);
  // Reset answers the same whether or not the email has an account.
  if (purpose === 'reset' && !existing) return json({ success: true, message: CODE_SENT });

  const code = generateVerificationCode();
  await saveVerificationCode(env, email, code, purpose);
  const delivered = await sendVerificationEmail(env, email, code, purpose);
  if (!delivered.success) {
    await env.DB!.prepare('DELETE FROM email_verification_codes WHERE email = ? AND code = ?').bind(email, code).run();
    return json({ error: '验证码发送失败，请稍后重试' }, 503);
  }
  return json({ success: true, message: CODE_SENT });
}

/** New password for the account of a verified email; every desktop is signed out as well. */
async function resetWithCode(request: Request, env: Env): Promise<Response> {
  const body = await readBody(request);
  const email = normalizedEmail(body);
  const code = (body.code || '').trim();
  const password = body.password || '';
  if (!email || !code || !password) return json({ error: '邮箱、验证码和新密码为必填项' }, 400);
  const weak = passwordPolicyError(password);
  if (weak) return json({ error: weak }, 400);
  if (!await allowRequest(env, 'email-reset', email, 10, 600)) return json({ error: TOO_MANY_TRIES }, 429);
  if (!await verifyAndConsumeCode(env, email, code, 'reset') || !await resetPassword(env, email, password)) {
    return json({ error: CODE_INVALID }, 400);
  }
  const user = await getUserByEmail(env, email);
  if (user) await revokeUserSessions(env, user.id);
  return json({ success: true, message: '密码已重置，请使用新密码登录' });
}

async function register(request: Request, env: Env): Promise<Response> {
  const body = await readBody(request);
  const email = normalizedEmail(body);
  const code = (body.code || '').trim();
  const password = body.password || '';
  if (!email || !code || !password) return json({ error: '邮箱、验证码和密码为必填项' }, 400);
  const weak = passwordPolicyError(password);
  if (weak) return json({ error: weak }, 400);
  if (!await allowRequest(env, 'email-register', email, 10, 600)) return json({ error: TOO_MANY_TRIES }, 429);
  if (!await verifyAndConsumeCode(env, email, code, 'register')) return json({ error: CODE_INVALID }, 400);

  const result = await registerUserWithEmail(env, email, password, (body.displayName || '').trim());
  if (result.error || !result.user) return json({ error: result.error || '注册失败' }, 400);
  const { cookieHeader } = await createSessionCookie(result.user.id, result.user.email, env.SESSION_SECRET);
  return signedIn(result.user, cookieHeader);
}

async function login(request: Request, env: Env): Promise<Response> {
  const body = await readBody(request);
  const email = normalizedEmail(body);
  const password = body.password || '';
  if (!email || !password) return json({ error: '请输入邮箱和密码' }, 400);
  if (!await allowRequest(env, 'email-login', email, 10, 600)) return json({ error: TOO_MANY_TRIES }, 429);
  // Across emails too, so one address cannot try passwords on many accounts.
  const address = request.headers.get('CF-Connecting-IP');
  if (address && !await allowRequest(env, 'email-login-ip', address, 30, 600)) return json({ error: TOO_MANY_TRIES }, 429);

  const result = await loginUserWithEmail(env, email, password);
  if (result.error || !result.user) return json({ error: result.error || '邮箱或密码错误' }, 401);
  const { cookieHeader } = await createSessionCookie(result.user.id, result.user.email, env.SESSION_SECRET, result.user.sessionVersion || 0);
  return signedIn(result.user, cookieHeader);
}

const ENDPOINTS: Record<string, { run: (request: Request, env: Env) => Promise<Response>; failure: string; log: string }> = {
  '/api/auth/email/send-code': { run: sendCode, failure: '发送验证码失败，请稍后重试', log: '[Send Code Error]:' },
  '/api/auth/email/reset-password': { run: resetWithCode, failure: '重置密码失败，请稍后重试', log: '[Reset Password Error]:' },
  '/api/auth/email/register': { run: register, failure: '注册发生服务异常，请重试', log: '[Register Error]:' },
  '/api/auth/email/login': { run: login, failure: '登录服务异常，请稍后重试', log: '[Email Login Error]:' },
};

/** Email sign-up, sign-in and password reset (POST /api/auth/email/*). */
export async function handleEmailAuthApi(request: Request, env: Env, url: URL): Promise<Response | null> {
  const endpoint = request.method === 'POST' ? ENDPOINTS[url.pathname] : undefined;
  if (!endpoint) return null;
  if (!methodEnabled(env, 'email')) return methodDisabledResponse();
  try {
    return await endpoint.run(request, env);
  } catch (err) {
    console.error(endpoint.log, err);
    return json({ error: endpoint.failure }, 500);
  }
}
