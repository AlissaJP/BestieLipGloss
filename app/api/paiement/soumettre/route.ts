import { NextRequest, NextResponse } from 'next/server';
import { incrementPromoUsage } from '@/lib/promoStore';

type PaiementStatut = 'en_attente' | 'validé' | 'refusé';

interface Paiement {
  id: number;
  id_commande: string;
  mode_paiement: 'moncash' | 'zelle' | 'card';
  statut: PaiementStatut;
  date_paiement: string;
  montant_paye: number | null;
  devise_paiement: 'HTG' | 'USD';
  reference_transaction: string | null;
}

const paiementStore = new Map<string, Paiement>();
let nextId = 1;

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    id_commande: string;
    mode_paiement: 'moncash' | 'zelle' | 'card';
    montant_paye?: number | null;
    devise_paiement?: 'HTG' | 'USD';
    reference_transaction?: string | null;
    note_client?: string | null; // TODO (BDD): à écrire dans Commande.note_client via /api/commandes
    code_promo?: string | null;
  };

  const { id_commande, mode_paiement, montant_paye, devise_paiement, reference_transaction, code_promo } = body;

  if (!id_commande || !mode_paiement) {
    return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });
  }

  // TODO (BDD): SELECT id, statut FROM Paiement WHERE id_commande = ?
  const existing = paiementStore.get(id_commande);

  if (existing) {
    if (existing.statut === 'en_attente') {
      return NextResponse.json({
        error: 'already_pending',
        message: "Ta preuve de paiement a déjà été envoyée. Notre équipe la vérifie et te contacte sur WhatsApp sous 2h.",
      }, { status: 409 });
    }
    if (existing.statut === 'validé') {
      return NextResponse.json({
        error: 'already_validated',
        message: 'Cette commande a déjà été payée.',
      }, { status: 409 });
    }
    // statut === 'refusé' → autoriser une nouvelle soumission
    // TODO (BDD):
    // UPDATE Paiement SET mode_paiement=?, statut='en_attente',
    //   date_paiement=NOW(), montant_paye=?, devise_paiement=?, reference_transaction=?
    // WHERE id_commande = ?
    existing.mode_paiement = mode_paiement;
    existing.statut = 'en_attente';
    existing.date_paiement = new Date().toISOString();
    existing.montant_paye = montant_paye ?? null;
    existing.devise_paiement = devise_paiement ?? 'HTG';
    existing.reference_transaction = reference_transaction ?? null;
    return NextResponse.json({ success: true, id_paiement: existing.id, action: 'updated' });
  }

  // TODO (BDD):
  // INSERT INTO Paiement (id_commande, mode_paiement, statut, date_paiement)
  // VALUES (?, ?, 'en_attente', NOW())
  // Protégé par UNIQUE(id_commande) — dernier filet si doublon concurrent
  const paiement: Paiement = {
    id: nextId++,
    id_commande,
    mode_paiement,
    statut: 'en_attente',
    date_paiement: new Date().toISOString(),
    montant_paye: montant_paye ?? null,
    devise_paiement: devise_paiement ?? 'HTG',
    reference_transaction: reference_transaction ?? null,
  };
  paiementStore.set(id_commande, paiement);

  if (code_promo) incrementPromoUsage(code_promo);

  return NextResponse.json({ success: true, id_paiement: paiement.id, action: 'created' });
}
