import { NextRequest, NextResponse } from 'next/server';

type Statut = 'en_attente' | 'publie' | 'refuse';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { statut }: { statut: Statut } = body;

  if (!['en_attente', 'publie', 'refuse'].includes(statut)) {
    return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 });
  }

  // TODO (BDD): UPDATE Avis SET statut = ? WHERE id = ?
  return NextResponse.json({ success: true, id: params.id, statut });
}
