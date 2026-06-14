import crypto from 'crypto';

interface TokenEntry {
  email: string;
  expiresAt: number;
}

const store = new Map<string, TokenEntry>();

export function createResetToken(email: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  store.set(token, { email, expiresAt: Date.now() + 1000 * 60 * 60 });
  return token;
}

export function verifyResetToken(
  token: string
): { valid: true; email: string } | { valid: false; reason: string } {
  const entry = store.get(token);
  if (!entry) return { valid: false, reason: 'Token expiré ou invalide.' };
  if (entry.expiresAt < Date.now()) {
    store.delete(token);
    return { valid: false, reason: 'Token expiré.' };
  }
  return { valid: true, email: entry.email };
}

export function consumeResetToken(token: string): boolean {
  if (!store.has(token)) return false;
  store.delete(token);
  return true;
}

