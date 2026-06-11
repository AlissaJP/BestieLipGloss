import { randomUUID } from 'crypto';

export const ADMIN_COOKIE = 'bestie_admin_session';

// In-memory store — clears on server restart (TODO(BDD): use Redis/DB)
const validTokens = new Set<string>();

export function createAdminToken(): string {
  const token = randomUUID();
  validTokens.add(token);
  return token;
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  return validTokens.has(token);
}
