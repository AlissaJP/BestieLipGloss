import { NextRequest, NextResponse } from 'next/server';
import { createOtpToken } from '@/lib/otpJwt';
import { sendOtpEmail } from '@/lib/email';

function genCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    email: string;
    name?: string;
    telephone?: string;
    pseudo?: string;
  };
  const { email, name, telephone, pseudo } = body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 });
  }

  // Inscription : name + telephone + pseudo obligatoires
  if (!name || !telephone || !pseudo) {
    return NextResponse.json({ error: "Nom, téléphone et nom d'utilisateur requis pour l'inscription." }, { status: 400 });
  }

  try {
    const code = genCode();

    // Crée un token signé (stateless — fonctionne sur Vercel serverless)
    const token = await createOtpToken(email, code, name, telephone, pseudo);

    // Envoie le code par e-mail
    await sendOtpEmail(email, code, name);

    // Le token est retourné au client (stocké dans sessionStorage côté front)
    return NextResponse.json({ success: true, token });

  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    console.error('[OTP] Erreur /api/otp/envoyer:', message);

    if (message.includes('BREVO_LOGIN_EMAIL') || message.includes('BREVO_API_KEY')) {
      return NextResponse.json({ error: 'Configuration e-mail manquante sur le serveur.' }, { status: 503 });
    }
    return NextResponse.json({ error: "Impossible d'envoyer l'e-mail de vérification." }, { status: 500 });
  }
}
