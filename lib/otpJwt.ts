// Stateless OTP token — works in serverless (Vercel) without shared memory.
// The 6-digit code is hashed via PBKDF2-SHA256 (100k iterations, salt = OTP_SECRET:email)
// inside a HMAC-signed token returned to the browser. Even if the JWT is stolen,
// brute-forcing 1M codes requires 10^11 PBKDF2 rounds — infeasible in the 2-min window.
// No server-side Map needed.

const ENC = new TextEncoder()

function getSecret(): string {
  const secret = process.env.OTP_SECRET;
  if (!secret) throw new Error('OTP_SECRET manquant dans les variables d\'environnement.');
  return secret;
}

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw', ENC.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
  )
}

function toB64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function fromB64url(str: string): ArrayBuffer {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') +
    '==='.slice(0, (4 - str.length % 4) % 4)
  const binary = atob(b64)
  const buf = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i)
  return buf.buffer
}

async function pbkdf2Hash(code: string, email: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', ENC.encode(code), { name: 'PBKDF2' }, false, ['deriveBits']
  )
  const salt = ENC.encode(`${getSecret()}:${email}`)
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' }, key, 256
  )
  return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('')
}

interface OtpPayload {
  email: string
  codeHash: string  // PBKDF2-SHA256(code, salt=OTP_SECRET:email, 100k iter) — brute-force resistant
  exp: number       // Unix ms expiry
  name: string
  telephone: string
  pseudo: string
}

export async function createOtpToken(
  email: string,
  code: string,
  name: string,
  telephone: string,
  pseudo: string
): Promise<string> {
  const codeHash = await pbkdf2Hash(code, email)
  const payload: OtpPayload = { email, codeHash, exp: Date.now() + 120_000, name, telephone, pseudo }
  const payloadB64 = toB64url(ENC.encode(JSON.stringify(payload)))
  const key = await importKey()
  const sig = await crypto.subtle.sign('HMAC', key, ENC.encode(payloadB64))
  return `${payloadB64}.${toB64url(new Uint8Array(sig))}`
}

export async function verifyOtpToken(
  token: string,
  email: string,
  code: string
): Promise<
  | { valid: true; pendingUser: { name: string; email: string; telephone: string; pseudo: string } }
  | { valid: false; reason: 'expired' | 'invalid' | 'not_found' }
> {
  if (!token?.trim()) return { valid: false, reason: 'not_found' }

  const dot = token.lastIndexOf('.')
  if (dot === -1) return { valid: false, reason: 'invalid' }

  const payloadB64 = token.slice(0, dot)
  const sigB64 = token.slice(dot + 1)

  // 1. Verify HMAC signature
  const key = await importKey()
  let sigOk = false
  try {
    sigOk = await crypto.subtle.verify(
      'HMAC', key, fromB64url(sigB64), ENC.encode(payloadB64)
    )
  } catch { /* invalid b64 */ }
  if (!sigOk) return { valid: false, reason: 'invalid' }

  // 2. Decode payload
  let payload: OtpPayload
  try {
    payload = JSON.parse(new TextDecoder().decode(fromB64url(payloadB64)))
  } catch { return { valid: false, reason: 'invalid' } }

  // 3. Email match
  if (payload.email !== email) return { valid: false, reason: 'invalid' }

  // 4. Expiry
  if (Date.now() > payload.exp) return { valid: false, reason: 'expired' }

  // 5. Code match (compare hashes — never expose actual code)
  const codeHash = await pbkdf2Hash(code, email)
  if (codeHash !== payload.codeHash) return { valid: false, reason: 'invalid' }

  return { valid: true, pendingUser: { name: payload.name, email, telephone: payload.telephone, pseudo: payload.pseudo } }
}
