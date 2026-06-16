import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, ADMIN_COOKIE } from '@/lib/adminAuth';

type Statut = 'en_attente' | 'publie' | 'refuse';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { statut }: { statut: Statut } = body;

  if (!['en_attente', 'publie', 'refuse'].includes(statut)) {
    return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 });
  }

  // TODO (BDD): UPDATE Avis SET statut = ? WHERE id = ?
  return NextResponse.json({ success: true, id, statut });
}
