import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id_variant, quantite = 1 } = body;

  if (!id_variant) {
    return NextResponse.json({ error: 'id_variant requis.' }, { status: 400 });
  }

  // TODO (BDD): vérifier la session utilisateur (cookie/JWT)
  // TODO (BDD):
  //   1. SELECT id FROM Panier WHERE id_utilisateur = :userId LIMIT 1
  //   2. Si absent : INSERT INTO Panier (id_utilisateur) VALUES (:userId)
  //   3. INSERT INTO PanierItem (id_panier, id_variant, quantite) VALUES (...)
  //      ON DUPLICATE KEY UPDATE quantite = quantite + :quantite

  return NextResponse.json({ success: true });
}
