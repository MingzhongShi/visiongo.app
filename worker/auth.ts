/**
 * Accounts, sessions and desktop tokens for VISIONGO.
 *
 * - Sessions are HttpOnly, Secure, SameSite=Lax HMAC-SHA256 signed cookies (auth/session.ts).
 * - Internal user IDs (UUID) are decoupled from provider identities and email (auth/users.ts).
 * - Desktop access tokens are signed with the edition's private key; auth codes and
 *   refresh tokens are HMAC signed (auth/desktopTokens.ts).
 * - Anonymous downloads remain accessible without authentication.
 */
export * from './auth/google';
export * from './auth/passwords';
export * from './auth/emailCodes';
export * from './auth/session';
export * from './auth/users';
export * from './auth/emailAccounts';
export * from './auth/downloadHistory';
export * from './auth/desktopTokens';
