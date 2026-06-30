import { NextRequest, NextResponse } from 'next/server';

const MONCASH_BASE = process.env.MONCASH_ENV === 'production'
  ? 'https://moncashbutton.digicelgroup.com/Api'
  : 'https://sandbox.moncashbutton.digicelgroup.com/Api';

async function getMoncashToken(): Promise<string> {
  const clientId = process.env.MONCASH_CLIENT_ID;
  const clientSecret = process.env.MONCASH_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Credentials MonCash manquants.');
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`${MONCASH_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
    body: 'grant_type=client_credentials&scope=read,write',
  });
  if (!res.ok) throw new Error(`MonCash token error: ${res.status}`);
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

// Appelé après le retour de MonCash pour vérifier la transaction
// GET /api/paiement/moncash/verifier?orderId=BES-2025-XXXXXX
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('orderId');
  if (!orderId) return NextResponse.json({ error: 'orderId manquant.' }, { status: 400 });

  try {
    const token = await getMoncashToken();

    const res = await fetch(`${MONCASH_BASE}/v1/RetrieveTransactionPayment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Transaction introuvable.' }, { status: 404 });
    }

    const data = await res.json() as {
      payment: {
        transactionId: string;
        cost: number;
        message: string;
        payer: string;
        payerMobile: string;
      }
    };

    // TODO (BDD): UPDATE Paiement SET statut='validé', reference_transaction=?, date_validation=NOW()
    //             WHERE id_commande = orderId
    //             UPDATE Commande SET statut='paid' WHERE id = orderId

    return NextResponse.json({
      success: true,
      transaction_id: data.payment.transactionId,
      montant: data.payment.cost,
      payer: data.payment.payerMobile,
    });

  } catch (err) {
    console.error('[MonCash] Vérification:', err);
    return NextResponse.json({ success: false, error: 'Erreur de vérification MonCash.' }, { status: 500 });
  }
}
