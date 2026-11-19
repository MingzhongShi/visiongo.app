/**
 * The website's own API (/api/*). One place for the request shape, JSON parsing
 * and the cached sign-in configuration that several components read.
 */

export interface ApiResult<T = any> {
  ok: boolean;
  status: number;
  /** The JSON body, or {} when the answer has none. */
  data: T;
}

/**
 * GET `path`, or POST `body` as JSON when one is given. Rejects only when the
 * request itself fails (network, abort, timeout); HTTP errors come back with ok false.
 */
export async function api<T = any>(path: string, body?: unknown, init: { signal?: AbortSignal } = {}): Promise<ApiResult<T>> {
  const response = await fetch(path, body === undefined ? { signal: init.signal } : {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: init.signal,
  });
  return { ok: response.ok, status: response.status, data: await response.json().catch(() => ({})) };
}

export type AuthMethod = 'email' | 'google' | 'github';
export const ALL_AUTH_METHODS: AuthMethod[] = ['email', 'google', 'github'];

/** GET /api/auth/config. */
export interface AuthConfig {
  methods?: AuthMethod[];
  /** False while this edition cannot send email: codes then come from a platform administrator. */
  emailDelivery?: boolean;
  googleClientId?: string | null;
  githubClientId?: string | null;
  /** Pages /auth/desktop may return an authorization code to (exact match). */
  portalRedirectUris?: string[];
}

let authConfigRequest: Promise<AuthConfig | null> | null = null;

/** The sign-in configuration, fetched once per page; null (and retried next time) when unavailable. */
export function loadAuthConfig(): Promise<AuthConfig | null> {
  authConfigRequest ??= api<AuthConfig>('/api/auth/config')
    .then(result => result.ok ? result.data : null)
    .catch(() => null)
    .then(config => { if (!config) authConfigRequest = null; return config; });
  return authConfigRequest;
}
