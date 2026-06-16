import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, ADMIN_COOKIE } from '@/lib/adminAuth';

type OrderStatus = 'pending' | 'paid' | 'shipping' | 'delivered' | 'cancelled';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const { id } = await params;
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
    id_commande: id,
    ancien_statut,
    nouveau_statut,
    date_changement: new Date().toISOString(),
    id_admin: id_admin ?? null,
    note: note ?? null,
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // TODO (BDD):
  // SELECT h.*, u.prenom as admin_prenom FROM HistoriqueStatutCommande h
  // LEFT JOIN Utilisateur u ON h.id_admin = u.id
  // WHERE h.id_commande = ?
  // ORDER BY h.date_changement ASC

  return NextResponse.json({
    id_commande: id,
    historique: [],
  });
}
