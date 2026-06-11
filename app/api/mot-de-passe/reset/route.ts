import { NextRequest, NextResponse } from 'next/server';
import { verifyResetToken, consumeResetToken } from '@/lib/resetTokens';

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();

  if (!token || !password || password.length < 6) {
    return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
  }

  const check = verifyResetToken(token);
  if (!check.valid) {
    return NextResponse.json({ error: check.reason }, { status: 400 });
  }

  // TODO (BDD):
  // UPDATE Utilisateur SET mot_de_passe_hash = hash(password) WHERE email = check.email
  consumeResetToken(token);

  return NextResponse.json({ success: true });
}
