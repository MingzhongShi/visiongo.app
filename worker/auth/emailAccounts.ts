import { Env, User } from '../types';
import { requireDatabase } from '../reliability';
import { equalStrings, generateSalt, hashPassword, LEGACY_PASSWORD_ITERATIONS, PASSWORD_ITERATIONS } from './passwords';
import { getUserByEmail } from './users';

/**
 * Registers a new user via verified email and password.
 */
export async function registerUserWithEmail(
  env: Env,
  email: string,
  password: string,
  displayName?: string
): Promise<{ user?: User; error?: string }> {
  requireDatabase(env);
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await getUserByEmail(env, normalizedEmail);
  if (existing) {
    return { error: '该邮箱已被注册，请直接登录' };
  }

  const salt = generateSalt();
  const hash = await hashPassword(password, salt, PASSWORD_ITERATIONS);
  const now = new Date().toISOString();
  const newUserId = `vg_usr_${crypto.randomUUID().slice(0, 12)}`;
  const tenantId = `vg_tenant_${crypto.randomUUID().slice(0, 12)}`;
  const finalDisplayName = displayName?.trim() || normalizedEmail.split('@')[0];

  const newUser: User & { passwordHash: string; passwordSalt: string } = {
    id: newUserId,
    tenantId,
    role: 'member',
    email: normalizedEmail,
    displayName: finalDisplayName,
    authProvider: 'email',
    passwordHash: hash,
    passwordSalt: salt,
    createdAt: now,
    lastLoginAt: now,
  };

  if (env.DB) {
    try {
      const syntheticSub = `email:${normalizedEmail}`;
      await env.DB.prepare(
        'INSERT INTO users (id, tenant_id, role, google_sub, auth_provider, email, display_name, password_hash, password_salt, password_iterations, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(
          newUserId,
          tenantId,
          'member',
          syntheticSub,
          'email',
          normalizedEmail,
          finalDisplayName,
          hash,
          salt,
          PASSWORD_ITERATIONS,
          now,
          now
        )
        .run();
    } catch (err) {
      throw err;
    }
  }

  return { user: newUser };
}

/**
 * Validates email and password, returning user if valid.
 */
export async function loginUserWithEmail(
  env: Env,
  email: string,
  password: string
): Promise<{ user?: User; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const userRecord = await getUserByEmail(env, normalizedEmail);
  if (!userRecord || !userRecord.passwordHash || !userRecord.passwordSalt) {
    return { error: '邮箱或密码错误，请重试' };
  }

  const iterations = userRecord.passwordIterations || LEGACY_PASSWORD_ITERATIONS;
  const computedHash = await hashPassword(password, userRecord.passwordSalt, iterations);
  if (!equalStrings(computedHash, userRecord.passwordHash)) {
    return { error: '邮箱或密码错误，请重试' };
  }

  const now = new Date().toISOString();
  if (env.DB) {
    if (iterations < PASSWORD_ITERATIONS) {
      // Upgrade the stored hash now that the password is known.
      const salt = generateSalt();
      const upgraded = await hashPassword(password, salt, PASSWORD_ITERATIONS);
      await env.DB.prepare('UPDATE users SET password_hash = ?, password_salt = ?, password_iterations = ? WHERE id = ?')
        .bind(upgraded, salt, PASSWORD_ITERATIONS, userRecord.id).run();
    }
    try {
      await env.DB.prepare('UPDATE users SET last_login_at = ? WHERE id = ?')
        .bind(now, userRecord.id)
        .run();
    } catch {
      // Ignore update error
    }
  }
  userRecord.lastLoginAt = now;

  return { user: userRecord };
}

/**
 * Sets a new password for the account of a verified email and voids its sessions.
 * Returns false when no account has that email.
 */
export async function resetPassword(env: Env, email: string, password: string): Promise<boolean> {
  const user = await getUserByEmail(env, email);
  if (!user) return false;
  const salt = generateSalt();
  const hash = await hashPassword(password, salt, PASSWORD_ITERATIONS);
  await requireDatabase(env).prepare(
    "UPDATE users SET password_hash = ?, password_salt = ?, password_iterations = ?, session_version = session_version + 1, auth_provider = COALESCE(auth_provider, 'email') WHERE id = ?"
  ).bind(hash, salt, PASSWORD_ITERATIONS, user.id).run();
  return true;
}
