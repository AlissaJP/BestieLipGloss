import { NextRequest, NextResponse } from 'next/server';
import { createOrRefreshOtp } from '@/lib/otpStore';
import { sendOtpEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    email: string;
    name?: string;
    telephone?: string;
  };
  const { email, name, telephone } = body;

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 });
  }

  try {
    const newUser = name && telephone ? { name, telephone } : undefined;
    const code = createOrRefreshOtp(email, newUser);

    await sendOtpEmail(email, code, name);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    console.error('[OTP] Erreur route /api/otp/envoyer:', message);

    if (message === 'no_pending') {
      return NextResponse.json(
        { error: 'Aucune inscription en cours pour cet e-mail.' },
        { status: 404 }
      );
    }
    if (message === 'RESEND_API_KEY manquant dans .env.local') {
      return NextResponse.json({ error: 'Configuration e-mail manquante.' }, { status: 503 });
    }
    return NextResponse.json({ error: "Impossible d'envoyer l'e-mail." }, { status: 500 });
  }
}
