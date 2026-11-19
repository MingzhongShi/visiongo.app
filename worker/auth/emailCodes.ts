import { Env } from '../types';
import { requireDatabase } from '../reliability';

export function generateVerificationCode(): string {
  const values = new Uint32Array(1);
  do { crypto.getRandomValues(values); } while (values[0] >= 4294800000);
  return String(100000 + values[0] % 900000);
}

export async function saveVerificationCode(env: Env, email: string, code: string, purpose = 'register',
                                           ttlMs = 600000): Promise<void> {
  const db = requireDatabase(env);
  await db.batch([
    db.prepare('DELETE FROM email_verification_codes WHERE email = ? AND purpose = ?').bind(email.toLowerCase().trim(), purpose),
    db.prepare('INSERT INTO email_verification_codes (id, email, code, purpose, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(`code_${crypto.randomUUID()}`, email.toLowerCase().trim(), code, purpose, Date.now() + ttlMs, new Date().toISOString()),
  ]);
}

export async function verifyAndConsumeCode(env: Env, email: string, code: string, purpose = 'register'): Promise<boolean> {
  // Atomic consumption prevents concurrent requests reusing a verification code.
  const record = await requireDatabase(env).prepare(
    'DELETE FROM email_verification_codes WHERE email = ? AND purpose = ? AND code = ? AND expires_at > ? RETURNING id'
  ).bind(email.toLowerCase().trim(), purpose, code.trim(), Date.now()).first<{ id: string }>();
  return !!record;
}

export type CodePurpose = 'register' | 'reset';

/** Sender of verification emails: EMAIL_FROM, else no-reply@ the edition's host. */
export function emailSender(env: Env): string {
  if (env.EMAIL_FROM?.trim()) return env.EMAIL_FROM.trim();
  let host = 'visiongo.app';
  try { if (env.PUBLIC_ORIGIN) host = new URL(env.PUBLIC_ORIGIN).hostname; } catch { /* keep default */ }
  return `VISIONGO <no-reply@${host}>`;
}

const CODE_MAIL: Record<CodePurpose, { subject: string; intro: string }> = {
  register: { subject: '注册验证码', intro: '您正在注册 VISIONGO 账户。请在页面中输入以下 6 位验证码：' },
  reset: { subject: '重置密码验证码', intro: '您正在重置 VISIONGO 账户的密码。请在页面中输入以下 6 位验证码：' },
};

export async function sendVerificationEmail(
  env: Env,
  email: string,
  code: string,
  purpose: CodePurpose = 'register'
): Promise<{ success: boolean; error?: string }> {
  if (!env.RESEND_API_KEY) return { success: false, error: 'Email service is not configured' };
  const mail = CODE_MAIL[purpose];
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailSender(env),
        to: [email],
        subject: `[VISIONGO] ${mail.subject}: ${code}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background: #09090b; color: #f4f4f5; border-radius: 16px; border: 1px solid #27272a;">
            <h2 style="color: #10b981; margin-top: 0; font-size: 20px;">VISIONGO 工业视觉智能平台</h2>
            <p style="font-size: 14px; color: #a1a1aa; line-height: 1.6;">${mail.intro}</p>
            <div style="background: #18181b; border: 1px solid #3f3f46; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;">
              <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ffffff;">${code}</span>
            </div>
            <p style="font-size: 12px; color: #71717a; margin-bottom: 0;">验证码 10 分钟内有效。如非本人操作，请忽略此邮件。</p>
          </div>
        `,
      }),
    });
    if (res.ok) return { success: true };
    console.warn(`[Resend Error] Status ${res.status}`);
  } catch (err) {
    console.warn('[Resend Request Error]', err);
  }
  return { success: false, error: 'Email delivery failed' };
}
