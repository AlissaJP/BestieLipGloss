import { NextRequest, NextResponse } from 'next/server';
import { codePromoStore } from '@/lib/promoStore';

// Vérifie si un code est valide pour l'ajouter à un compte (sans vérifier le montant minimum).
// Ne révèle jamais la raison d'invalidité pour éviter l'énumération des codes.
// TODO (BDD): SELECT id FROM CodePromo WHERE code = ? AND actif = TRUE AND (date_expiration IS NULL OR date_expiration > NOW()) AND (nb_utilisations_max IS NULL OR nb_utilisations_actuel < nb_utilisations_max)
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')?.toUpperCase().trim();

  if (!code) {
    return NextResponse.json({ valid: false });
  }

  const promo = codePromoStore.find((p) => p.code === code);

  const isValid =
    !!promo &&
    promo.actif &&
    (!promo.date_expiration || new Date(promo.date_expiration) >= new Date()) &&
    (promo.nb_utilisations_max === null || promo.nb_utilisations_actuel < promo.nb_utilisations_max);

  // Retourne uniquement valid: true/false — jamais la raison
  return NextResponse.json({ valid: isValid });
}
