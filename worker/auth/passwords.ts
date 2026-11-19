import { passwordProblem, passwordProblemText } from '../../shared/passwordPolicy';

/**
 * Derives a PBKDF2 hash using Web Crypto API.
 */
/** PBKDF2 iterations of new password hashes; older hashes are upgraded on the next sign-in. */
export const PASSWORD_ITERATIONS = 210000;
/** Iterations of hashes stored before password_iterations existed. */
export const LEGACY_PASSWORD_ITERATIONS = 50000;

/** Returns why a new password is not acceptable (Chinese message), or null. Same rule as the sign-up form. */
export function passwordPolicyError(password: string): string | null {
  const problem = passwordProblem(password);
  return problem ? passwordProblemText(problem, true) : null;
}

export function equalStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}

export async function hashPassword(password: string, salt: string, iterations = LEGACY_PASSWORD_ITERATIONS): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
