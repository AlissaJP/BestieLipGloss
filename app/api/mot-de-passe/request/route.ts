import { NextRequest, NextResponse } from 'next/server';
import { createResetToken, verifyResetToken } from '@/lib/resetTokens';

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 });
  }

  // TODO (BDD): INSERT INTO TokenReset (id_utilisateur, token, expires_at) VALUES (...)
  const token = createResetToken(email);

  // TODO (Email): envoyer le lien via Resend / SendGrid
  // await sendResetEmail(email, `${BASE_URL}/reinitialiser-mot-de-passe?token=${token}`);

  // En dev, on retourne le token pour tester le flux sans email
  const isDev = process.env.NODE_ENV !== 'production';
  return NextResponse.json({ success: true, ...(isDev && { devToken: token }) });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ valid: false }, { status: 400 });

  const result = verifyResetToken(token);
  if (!result.valid) {
    return NextResponse.json({ valid: false, reason: result.reason }, { status: 400 });
  }

  return NextResponse.json({ valid: true, email: result.email });
}
