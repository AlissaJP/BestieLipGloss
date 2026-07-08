import { NextRequest, NextResponse } from 'next/server';
import { signAmountToken } from '@/lib/paymentToken';

// MonCash Merchant Payment API
// Documentation : https://sandbox.moncashbutton.digicelgroup.com/Moncash-business/
//
// Variables d'environnement requises (à configurer sur Vercel) :
//   MONCASH_CLIENT_ID      — fourni par Digicel/MonCash lors de l'inscription marchande
//   MONCASH_CLIENT_SECRET  — fourni par Digicel/MonCash
//   MONCASH_ENV            — 'sandbox' | 'production'
//   NEXT_PUBLIC_BASE_URL   — ex. https://bestie-lipgloss.vercel.app

const MONCASH_BASE = process.env.MONCASH_ENV === 'production'
  ? 'https://moncashbutton.digicelgroup.com/Api'
  : 'https://sandbox.moncashbutton.digicelgroup.com/Api';

const MONCASH_REDIRECT = process.env.MONCASH_ENV === 'production'
  ? 'https://moncashbutton.digicelgroup.com/Moncash-middleware/Payment/Redirect'
  : 'https://sandbox.moncashbutton.digicelgroup.com/Moncash-middleware/Payment/Redirect';

async function getMoncashToken(): Promise<string> {
  const clientId = process.env.MONCASH_CLIENT_ID;
  const clientSecret = process.env.MONCASH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('MONCASH_CLIENT_ID ou MONCASH_CLIENT_SECRET manquant dans les variables d\'environnement.');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${MONCASH_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: 'grant_type=client_credentials&scope=read,write',
  });

  if (!res.ok) throw new Error(`MonCash token error: ${res.status}`);
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export async function POST(request: NextRequest) {
  const { id_commande, montant_htg } = await request.json() as {
    id_commande: string;
    montant_htg: number;
  };

  if (!id_commande || !montant_htg) {
    return NextResponse.json({ error: 'id_commande et montant_htg requis.' }, { status: 400 });
  }

  try {
    const token = await getMoncashToken();

    // Crée le paiement MonCash
    const payRes = await fetch(`${MONCASH_BASE}/v1/CreatePayment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        amount: montant_htg,
        orderId: id_commande,
      }),
    });

    if (!payRes.ok) {
      const err = await payRes.json().catch(() => ({}));
      console.error('[MonCash] CreatePayment error:', err);
      return NextResponse.json({ error: 'Erreur lors de la création du paiement MonCash.' }, { status: 502 });
    }

    const payData = await payRes.json() as { payment_token?: { token: string } };
    const paymentToken = payData.payment_token?.token;

    if (!paymentToken) {
      return NextResponse.json({ error: 'Token de paiement MonCash manquant.' }, { status: 502 });
    }

    const redirectUrl = `${MONCASH_REDIRECT}?token=${paymentToken}`;
    const amountToken = await signAmountToken(id_commande, montant_htg);

    return NextResponse.json({ success: true, redirect_url: redirectUrl, payment_token: paymentToken, amount_token: amountToken });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[MonCash] Erreur initiation:', message);

    if (message.includes('manquant dans les variables')) {
      return NextResponse.json({ error: 'MonCash non configuré sur ce serveur.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Impossible d\'initier le paiement MonCash.' }, { status: 500 });
  }
}
