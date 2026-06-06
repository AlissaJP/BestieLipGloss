import { NextRequest, NextResponse } from 'next/server';

type OrderStatus = 'pending' | 'paid' | 'shipping' | 'delivered' | 'cancelled';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { nouveau_statut, ancien_statut, id_admin, note } = await request.json() as {
    nouveau_statut: OrderStatus;
    ancien_statut: OrderStatus | null;
    id_admin?: number | null;
    note?: string | null;
  };

  const validStatuts: OrderStatus[] = ['pending', 'paid', 'shipping', 'delivered', 'cancelled'];
  if (!validStatuts.includes(nouveau_statut)) {
    return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 });
  }

  // TODO (BDD):
  // INSERT INTO HistoriqueStatutCommande
  //   (id_commande, ancien_statut, nouveau_statut, id_admin, note)
  // VALUES (?, ?, ?, ?, ?)
  //
  // UPDATE Commande SET statut = ?, updated_at = NOW() WHERE id = ?

  return NextResponse.json({
    success: true,
    id_commande: params.id,
    ancien_statut,
    nouveau_statut,
    date_changement: new Date().toISOString(),
    id_admin: id_admin ?? null,
    note: note ?? null,
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO (BDD):
  // SELECT h.*, u.prenom as admin_prenom FROM HistoriqueStatutCommande h
  // LEFT JOIN Utilisateur u ON h.id_admin = u.id
  // WHERE h.id_commande = ?
  // ORDER BY h.date_changement ASC

  // Stub: return derived timeline from order status (replace with real DB query)
  return NextResponse.json({
    id_commande: params.id,
    historique: [],
  });
}
