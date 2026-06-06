import { NextRequest, NextResponse } from 'next/server';

type Decision = 'validé' | 'refusé';

interface ValiderBody {
  decision: Decision;
  note_admin?: string;
  id_admin?: number;
}

// In-memory stub — mirrors paiementStore from soumettre/route.ts
// TODO (BDD):
// UPDATE Paiement SET statut=?, note_admin=?, date_validation=NOW(), id_admin_validateur=?
// WHERE id = ?
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID invalide.' }, { status: 400 });
  }

  const body = await request.json() as ValiderBody;
  const { decision, note_admin, id_admin } = body;

  if (decision !== 'validé' && decision !== 'refusé') {
    return NextResponse.json({ error: 'Décision invalide.' }, { status: 400 });
  }

  // TODO (BDD): SELECT then UPDATE
  void id_admin;

  return NextResponse.json({
    success: true,
    id_paiement: id,
    statut: decision,
    note_admin: note_admin ?? null,
    date_validation: new Date().toISOString(),
  });
}
