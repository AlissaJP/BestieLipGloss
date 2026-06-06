import { NextRequest, NextResponse } from 'next/server';

export type Statut = 'en_attente' | 'publie' | 'refuse';

export interface Avis {
  id: number;
  id_produit: number;
  id_utilisateur: number;
  nom_client: string;
  note: number;
  texte: string;
  date_creation: string;
  statut: Statut;
  commande_verifiee: boolean;
}

// TODO (BDD): SELECT a.*, u.prenom, u.nom FROM Avis a JOIN Utilisateur u ON a.id_utilisateur = u.id
export const avisStore = new Map<number, Avis>([
  [1, { id: 1, id_produit: 1, id_utilisateur: 1, nom_client: 'Jessica B.', note: 5, texte: "Absolument obsédée ! La texture est parfaite et la tenue dure longtemps.", date_creation: '2024-11-28T10:00:00Z', statut: 'en_attente', commande_verifiee: true }],
  [2, { id: 2, id_produit: 1, id_utilisateur: 2, nom_client: 'Marlène C.', note: 5, texte: "Le meilleur gloss que j'ai jamais utilisé. Sent bon et hydrate vraiment.", date_creation: '2024-11-21T14:00:00Z', statut: 'publie', commande_verifiee: true }],
  [3, { id: 3, id_produit: 2, id_utilisateur: 3, nom_client: 'Sophonie T.', note: 4, texte: "Super produit ! Je vais en commander d'autres teintes.", date_creation: '2024-11-14T09:00:00Z', statut: 'publie', commande_verifiee: false }],
  [4, { id: 4, id_produit: 1, id_utilisateur: 4, nom_client: 'Marie L.', note: 3, texte: "Pas mal, mais l'emballage était un peu abîmé à la réception.", date_creation: '2024-12-01T08:00:00Z', statut: 'en_attente', commande_verifiee: false }],
  [5, { id: 5, id_produit: 3, id_utilisateur: 5, nom_client: 'Adeline M.', note: 5, texte: "Parfait ! Je recommande à toutes mes amies.", date_creation: '2024-12-02T11:00:00Z', statut: 'refuse', commande_verifiee: false }],
]);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const statut = searchParams.get('statut');
  const idProduit = searchParams.get('id_produit');

  let results = Array.from(avisStore.values());

  if (statut) results = results.filter((a) => a.statut === statut);
  if (idProduit) results = results.filter((a) => a.id_produit === parseInt(idProduit, 10));

  results.sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());

  return NextResponse.json({ avis: results });
}
