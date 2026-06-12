const MAX_ATTEMPTS = 5;

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
  pendingUser: { name: string; email: string; telephone: string };
}

// In-memory store — TODO (BDD): remplacer par INSERT INTO OtpVerification
const store = new Map<string, OtpEntry>();

export function createOrRefreshOtp(
  email: string,
  newUser?: { name: string; telephone: string }
): string {
  const existing = store.get(email);
  if (!newUser && !existing) throw new Error('no_pending');

  const pendingUser = newUser
    ? { name: newUser.name, email, telephone: newUser.telephone }
    : existing!.pendingUser;

  const code = String(Math.floor(100000 + Math.random() * 900000));
  store.set(email, { code, expiresAt: Date.now() + 120_000, attempts: 0, pendingUser });
  return code;
}

export function verifyOtp(
  email: string,
  code: string
): { valid: true; pendingUser: OtpEntry['pendingUser'] } | { valid: false; reason: 'expired' | 'invalid' | 'not_found' | 'too_many_attempts' } {
  const entry = store.get(email);
  if (!entry) return { valid: false, reason: 'not_found' };
  if (Date.now() > entry.expiresAt) {
    store.delete(email);
    return { valid: false, reason: 'expired' };
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(email);
    return { valid: false, reason: 'too_many_attempts' };
  }
  if (entry.code !== code) {
    entry.attempts++;
    if (entry.attempts >= MAX_ATTEMPTS) store.delete(email);
    return { valid: false, reason: 'invalid' };
  }
  const { pendingUser } = entry;
  store.delete(email);
  return { valid: true, pendingUser };
}
