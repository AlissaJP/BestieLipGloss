import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Stockage en mémoire — remplacer par INSERT INTO TokenReset quand la BDD est prête
const tokenStore = new Map<string, { email: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 1000 * 60 * 60; // 1 heure

  // TODO (BDD): INSERT INTO TokenReset (id_utilisateur, token, expires_at) VALUES (...)
  tokenStore.set(token, { email, expiresAt });

  // TODO (Email): envoyer le lien via Resend / SendGrid
  // await sendResetEmail(email, `${BASE_URL}/reinitialiser-mot-de-passe?token=${token}`);

  // En dev, on retourne le token pour tester le flux sans email
  const isDev = process.env.NODE_ENV !== 'production';
  return NextResponse.json({ success: true, ...(isDev && { devToken: token }) });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ valid: false }, { status: 400 });

  const entry = tokenStore.get(token);
  if (!entry || entry.expiresAt < Date.now()) {
    return NextResponse.json({ valid: false, reason: 'Token expiré ou invalide.' }, { status: 400 });
  }

  return NextResponse.json({ valid: true, email: entry.email });
}
