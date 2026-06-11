import { NextRequest, NextResponse } from 'next/server';
import { codePromoStore } from '@/lib/promoStore';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code')?.toUpperCase().trim();
  const montant = parseFloat(searchParams.get('montant') ?? '0') || 0;

  if (!code) {
    return NextResponse.json({ valid: false, reason: 'Code manquant.' }, { status: 400 });
  }

  // 1. Existe et actif
  const promo = codePromoStore.find((p) => p.code === code);
  if (!promo || !promo.actif) {
    return NextResponse.json({ valid: false, reason: 'Code promo invalide.' });
  }

  // 2. Date d'expiration
  if (promo.date_expiration && new Date(promo.date_expiration) < new Date()) {
    return NextResponse.json({ valid: false, reason: 'Ce code promo a expiré.' });
  }

  // 3. Limite d'utilisations
  if (promo.nb_utilisations_max !== null && promo.nb_utilisations_actuel >= promo.nb_utilisations_max) {
    return NextResponse.json({ valid: false, reason: "Ce code a atteint sa limite d'utilisation." });
  }

  // 4. Montant minimum
  if (promo.montant_minimum !== null && montant < promo.montant_minimum) {
    return NextResponse.json({ valid: false, reason: `Commande minimum de ${promo.montant_minimum} HTG requise.` });
  }

  // TODO (BDD) à la validation commande: UPDATE CodePromo SET nb_utilisations_actuel = nb_utilisations_actuel + 1 WHERE id = ?
  return NextResponse.json({
    valid: true,
    code: promo.code,
    reduction_pct: promo.reduction_pct,
    type_reduction: promo.type_reduction,
  });
}
