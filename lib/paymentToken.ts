// Signed amount token — prevents client-side montant manipulation on MonCash payments.
// initier/route.ts signs {orderId, montant, exp} with HMAC-SHA256 using OTP_SECRET.
// verifier/route.ts verifies the signature and compares against the amount MonCash reports.

const ENC = new TextEncoder();

function toB64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function fromB64url(str: string): ArrayBuffer {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') +
    '==='.slice(0, (4 - str.length % 4) % 4);
  const binary = atob(b64);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf.buffer;
}

function getSecret(): string {
  const s = process.env.OTP_SECRET;
  if (!s) throw new Error('OTP_SECRET manquant pour signer le token de paiement.');
  return s;
}

export async function signAmountToken(orderId: string, montant: number): Promise<string> {
  const payload = JSON.stringify({ orderId, montant, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const payloadB64 = toB64url(ENC.encode(payload));
  const key = await crypto.subtle.importKey(
    'raw', ENC.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, ENC.encode(payloadB64));
  return `${payloadB64}.${toB64url(new Uint8Array(sig))}`;
}

export async function verifyAmountToken(
  token: string
): Promise<{ orderId: string; montant: number } | null> {
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;
  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  const key = await crypto.subtle.importKey(
    'raw', ENC.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  );
  let sigOk = false;
  try {
    sigOk = await crypto.subtle.verify('HMAC', key, fromB64url(sigB64), ENC.encode(payloadB64));
  } catch { return null; }
  if (!sigOk) return null;
  let payload: { orderId: string; montant: number; exp: number };
  try {
    payload = JSON.parse(new TextDecoder().decode(fromB64url(payloadB64)));
  } catch { return null; }
  if (Date.now() > payload.exp) return null;
  return { orderId: payload.orderId, montant: payload.montant };
}
