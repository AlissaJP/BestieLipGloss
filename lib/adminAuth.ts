export const ADMIN_COOKIE = 'bestie_admin_session';

async function getKey(): Promise<CryptoKey> {
  const secret = (process.env.ADMIN_PASSWORD ?? 'dev') + (process.env.ADMIN_USERNAME ?? 'admin');
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function signUUID(uuid: string): Promise<string> {
  const key = await getKey();
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(uuid));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function createAdminToken(): Promise<string> {
  const uuid = globalThis.crypto.randomUUID();
  const sig = await signUUID(uuid);
  return `${uuid}.${sig}`;
}

export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dot = token.lastIndexOf('.');
  if (dot === -1) return false;
  const uuid = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const expected = await signUUID(uuid);
    return expected === sig;
  } catch {
    return false;
  }
}
