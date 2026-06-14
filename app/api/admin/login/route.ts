import { NextRequest, NextResponse } from 'next/server';
import { createAdminToken, ADMIN_COOKIE } from '@/lib/adminAuth';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 min

const attempts = new Map<string, { count: number; since: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.since > WINDOW_MS) {
    attempts.set(ip, { count: 1, since: now });
    return false;
  }
  if (entry.count >= MAX_ATTEMPTS) return true;
  entry.count++;
  return false;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessaie dans 15 minutes.' }, { status: 429 });
  }

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return NextResponse.json({ error: 'Configuration serveur manquante.' }, { status: 500 });
  }

  const { username, password } = await request.json();

  if (username !== adminUsername || password !== adminPassword) {
    return NextResponse.json({ error: 'Identifiants invalides.' }, { status: 401 });
  }

  attempts.delete(ip);

  const token = await createAdminToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 heures
    path: '/',
  });

  return response;
}
