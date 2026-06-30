import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, ADMIN_COOKIE } from '@/lib/adminAuth';
import { codePromoStore, createPromo, togglePromoActif, deletePromo, type CodePromo } from '@/lib/promoStore';

// GET — liste tous les codes promo (admin seulement)
export async function GET(request: NextRequest) {
  if (!(await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  return NextResponse.json({ promos: [...codePromoStore] });
}

// POST — crée un nouveau code promo (admin seulement)
export async function POST(request: NextRequest) {
  if (!(await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const body = await request.json() as Partial<CodePromo>;
  const { code, reduction_pct, type_reduction, date_expiration, nb_utilisations_max, montant_minimum } = body;

  if (!code?.trim() || !type_reduction || (reduction_pct == null)) {
    return NextResponse.json({ error: 'Code, type et valeur de réduction requis.' }, { status: 400 });
  }

  const codeUpper = code.trim().toUpperCase();
  if (codePromoStore.find((p) => p.code === codeUpper)) {
    return NextResponse.json({ error: 'Ce code existe déjà.' }, { status: 409 });
  }

  const promo = createPromo({
    code: codeUpper,
    reduction_pct: Number(reduction_pct),
    type_reduction: type_reduction as 'pct' | 'fixe',
    date_expiration: date_expiration ?? null,
    nb_utilisations_max: nb_utilisations_max ?? null,
    montant_minimum: montant_minimum ?? null,
    actif: true,
  });

  return NextResponse.json({ success: true, promo }, { status: 201 });
}

// PATCH — toggle actif / PATCH body: { id, actif }
export async function PATCH(request: NextRequest) {
  if (!(await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  const { id } = await request.json() as { id: number };
  if (!id) return NextResponse.json({ error: 'id requis.' }, { status: 400 });
  togglePromoActif(id);
  return NextResponse.json({ success: true });
}

// DELETE
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  const { id } = await request.json() as { id: number };
  if (!id) return NextResponse.json({ error: 'id requis.' }, { status: 400 });
  deletePromo(id);
  return NextResponse.json({ success: true });
}
