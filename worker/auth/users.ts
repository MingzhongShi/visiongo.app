import { Env, User } from '../types';
import { requireDatabase } from '../reliability';
import { LEGACY_PASSWORD_ITERATIONS } from './passwords';
import type { GoogleProfile } from './google';

/**
 * Queries user by email across D1.
 */
export async function getUserByEmail(
  env: Env,
  email: string
): Promise<(User & { passwordHash?: string; passwordSalt?: string; passwordIterations?: number }) | null> {
  requireDatabase(env);
  const normalizedEmail = email.toLowerCase().trim();

  if (env.DB) {
    try {
      const row = await env.DB.prepare(
        'SELECT id, tenant_id, role, google_sub, github_id, auth_provider, email, display_name, avatar_url, password_hash, password_salt, password_iterations, session_version, created_at, last_login_at FROM users WHERE LOWER(email) = ? ORDER BY created_at, id LIMIT 1'
      )
        .bind(normalizedEmail)
        .first<{
          id: string;
          tenant_id: string;
          role: 'super_admin' | 'org_admin' | 'member';
          google_sub: string | null;
          github_id: string | null;
          auth_provider: 'google' | 'github' | 'email' | null;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          password_hash: string | null;
          password_salt: string | null;
          password_iterations: number | null;
          session_version: number | null;
          created_at: string;
          last_login_at: string;
        }>();

      if (row) {
        return {
          id: row.id,
          tenantId: row.tenant_id,
          role: row.role,
          googleSub: row.google_sub || undefined,
          githubId: row.github_id || undefined,
          authProvider: row.auth_provider || 'email',
          email: row.email,
          displayName: row.display_name || undefined,
          avatarUrl: row.avatar_url || undefined,
          passwordHash: row.password_hash || undefined,
          passwordSalt: row.password_salt || undefined,
          passwordIterations: row.password_iterations || LEGACY_PASSWORD_ITERATIONS,
          sessionVersion: row.session_version || 0,
          createdAt: row.created_at,
          lastLoginAt: row.last_login_at,
        };
      }
    } catch (err) {
      throw err;
    }
  }

  return null;
}

export interface GitHubProfile {
  id: string | number;
  login: string;
  name?: string;
  email?: string;
  avatar_url?: string;
}

/**
 * Upserts a GitHub OAuth user into D1.
 */
export async function getOrCreateGitHubUser(
  env: Env,
  profile: GitHubProfile
): Promise<User> {
  requireDatabase(env);
  const now = new Date().toISOString();
  const githubId = String(profile.id);
  const email = (profile.email || `${profile.login}@users.noreply.github.com`).toLowerCase().trim();
  const displayName = profile.name || profile.login;
  const avatarUrl = profile.avatar_url;

  if (env.DB) {
    try {
      const existing = await env.DB.prepare(
        'SELECT id, tenant_id, role, google_sub, github_id, email, display_name, avatar_url, session_version, created_at, last_login_at FROM users WHERE github_id = ? OR (google_sub = ?)'
      )
        .bind(githubId, `github:${githubId}`)
        .first<{
          id: string;
          tenant_id: string;
          role: 'super_admin' | 'org_admin' | 'member';
          google_sub: string | null;
          github_id: string | null;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          session_version: number | null;
          created_at: string;
          last_login_at: string;
        }>();

      if (existing) {
        await env.DB.prepare(
          'UPDATE users SET last_login_at = ?, display_name = ?, avatar_url = ?, github_id = ? WHERE id = ?'
        )
          .bind(now, displayName, avatarUrl || existing.avatar_url, githubId, existing.id)
          .run();

        return {
          id: existing.id,
          tenantId: existing.tenant_id,
          role: existing.role,
          githubId,
          authProvider: 'github',
          email: existing.email,
          displayName,
          avatarUrl: avatarUrl || existing.avatar_url || undefined,
          createdAt: existing.created_at,
          lastLoginAt: now,
          sessionVersion: existing.session_version || 0,
        };
      }

      if (profile.email) {
        // The verified email of an account without GitHub links GitHub to it: one account per person.
        const linked = await linkableAccount(env, email, 'github');
        if (linked) {
          await env.DB.prepare('UPDATE users SET github_id = ?, last_login_at = ?, avatar_url = COALESCE(avatar_url, ?) WHERE id = ?')
            .bind(githubId, now, avatarUrl || null, linked.id).run();
          return { ...linked, githubId, lastLoginAt: now };
        }
      }

      const newUserId = `vg_usr_${crypto.randomUUID().slice(0, 12)}`;
      const tenantId = `vg_tenant_${crypto.randomUUID().slice(0, 12)}`;
      const syntheticSub = `github:${githubId}`;
      await env.DB.prepare(
        'INSERT INTO users (id, tenant_id, role, google_sub, github_id, auth_provider, email, display_name, avatar_url, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(newUserId, tenantId, 'member', syntheticSub, githubId, 'github', email, displayName, avatarUrl || null, now, now)
        .run();

      return {
        id: newUserId,
        tenantId,
        role: 'member',
        githubId,
        authProvider: 'github',
        email,
        displayName,
        avatarUrl,
        createdAt: now,
        lastLoginAt: now,
      };
    } catch (err) {
      throw err;
    }
  }

  throw new Error('Identity persistence unavailable');
}

/**
 * The oldest account with this (provider-verified) email that has no identity of
 * the provider yet: no github_id, or only a synthetic google_sub (email:/github:).
 */
async function linkableAccount(env: Env, email: string, provider: 'google' | 'github'): Promise<User | null> {
  const unlinked = provider === 'github'
    ? 'github_id IS NULL'
    : "(google_sub LIKE 'email:%' OR google_sub LIKE 'github:%')";
  const row = await requireDatabase(env).prepare(
    `SELECT id FROM users WHERE LOWER(email) = ? AND ${unlinked} ORDER BY created_at, id LIMIT 1`
  ).bind(email.toLowerCase().trim()).first<{ id: string }>();
  return row ? getUserById(env, row.id) : null;
}

/**
 * Upserts a Google user in Cloudflare D1. Database errors fail authentication.
 */
export async function getOrCreateUser(
  env: Env,
  profile: GoogleProfile
): Promise<User> {
  requireDatabase(env);
  const now = new Date().toISOString();

  if (env.DB) {
    try {
      const existing = await env.DB.prepare(
        'SELECT id, tenant_id, role, google_sub, email, display_name, avatar_url, session_version, created_at, last_login_at FROM users WHERE google_sub = ?'
      )
        .bind(profile.sub)
        .first<{
          id: string;
          tenant_id: string;
          role: 'super_admin' | 'org_admin' | 'member';
          google_sub: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          session_version: number | null;
          created_at: string;
          last_login_at: string;
        }>();

      if (existing) {
        await env.DB.prepare(
          'UPDATE users SET last_login_at = ?, display_name = ?, avatar_url = ? WHERE id = ?'
        )
          .bind(now, profile.name || existing.display_name, profile.picture || existing.avatar_url, existing.id)
          .run();

        return {
          id: existing.id,
          tenantId: existing.tenant_id,
          role: existing.role,
          googleSub: existing.google_sub,
          authProvider: 'google',
          email: existing.email,
          displayName: profile.name || existing.display_name || undefined,
          avatarUrl: profile.picture || existing.avatar_url || undefined,
          createdAt: existing.created_at,
          lastLoginAt: now,
          sessionVersion: existing.session_version || 0,
        };
      }

      // The verified email of an account without Google links Google to it: one account per person.
      const linked = await linkableAccount(env, profile.email, 'google');
      if (linked) {
        await env.DB.prepare('UPDATE users SET google_sub = ?, last_login_at = ?, avatar_url = COALESCE(avatar_url, ?) WHERE id = ?')
          .bind(profile.sub, now, profile.picture || null, linked.id).run();
        return { ...linked, googleSub: profile.sub, lastLoginAt: now };
      }

      // Create new user with internal UUID
      const newUserId = `vg_usr_${crypto.randomUUID().slice(0, 12)}`;
      const tenantId = `vg_tenant_${crypto.randomUUID().slice(0, 12)}`;
      await env.DB.prepare(
        'INSERT INTO users (id, tenant_id, role, google_sub, auth_provider, email, display_name, avatar_url, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(newUserId, tenantId, 'member', profile.sub, 'google', profile.email, profile.name || null, profile.picture || null, now, now)
        .run();

      return {
        id: newUserId,
        tenantId,
        role: 'member',
        googleSub: profile.sub,
        authProvider: 'google',
        email: profile.email,
        displayName: profile.name,
        avatarUrl: profile.picture,
        createdAt: now,
        lastLoginAt: now,
      };
    } catch (err) {
      throw err;
    }
  }

  throw new Error('Identity persistence unavailable');
}

/**
 * Loads a user by their internal UUID from D1.
 */
export async function getUserById(env: Env, userId: string): Promise<User | null> {
  requireDatabase(env);
  if (env.DB) {
    try {
      const row = await env.DB.prepare(
        'SELECT id, tenant_id, role, google_sub, github_id, auth_provider, email, display_name, avatar_url, session_version, created_at, last_login_at FROM users WHERE id = ?'
      )
        .bind(userId)
        .first<{
          id: string;
          tenant_id: string;
          role: 'super_admin' | 'org_admin' | 'member';
          google_sub: string | null;
          github_id: string | null;
          auth_provider: 'google' | 'github' | 'email' | null;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          session_version: number | null;
          created_at: string;
          last_login_at: string;
        }>();

      if (row) {
        // Reject historical sessions minted by the removed unauthenticated demo endpoint.
        if (row.github_id === 'gh_demo_1092834' || row.google_sub === 'github:gh_demo_1092834') return null;
        return {
          id: row.id,
          tenantId: row.tenant_id,
          role: row.role,
          googleSub: row.google_sub || undefined,
          githubId: row.github_id || undefined,
          authProvider: row.auth_provider || 'google',
          email: row.email,
          displayName: row.display_name || undefined,
          avatarUrl: row.avatar_url || undefined,
          createdAt: row.created_at,
          lastLoginAt: row.last_login_at,
          sessionVersion: row.session_version || 0,
        };
      }
    } catch (err) {
      throw err;
    }
  }

  return null;
}
