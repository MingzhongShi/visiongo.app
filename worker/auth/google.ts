export interface GoogleProfile {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

/** Verifies a Google ID token server-side. */
export async function verifyGoogleIdToken(
  idToken: string,
  expectedClientId?: string
): Promise<GoogleProfile | null> {
  if (!idToken || typeof idToken !== 'string') {
    return null;
  }

  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!res.ok) {
      console.warn(`[Auth] Google token verification failed: HTTP ${res.status}`);
      return null;
    }

    const payload = (await res.json()) as {
      sub: string;
      email: string;
      email_verified?: string | boolean;
      name?: string;
      picture?: string;
      aud?: string;
      exp?: string | number;
    };

    if (!payload.sub || !payload.email || !expectedClientId || payload.aud !== expectedClientId ||
        ![true, 'true'].includes(payload.email_verified ?? false) || !payload.exp || !Number.isFinite(Number(payload.exp)) || Number(payload.exp) * 1000 <= Date.now()) {
      return null;
    }


    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (err) {
    console.error('[Auth Error] Error verifying Google token:', err);
    return null;
  }
}
