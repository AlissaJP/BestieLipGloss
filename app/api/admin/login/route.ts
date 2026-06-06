import { NextRequest, NextResponse } from 'next/server';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'bestie2024';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Identifiants invalides.' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('bestie_admin_session', 'admin_authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 heures
    path: '/',
  });

  return response;
}
