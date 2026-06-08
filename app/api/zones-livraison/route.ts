import { NextResponse } from 'next/server';

export interface ZoneLivraison {
  id: number;
  nom_zone: string;
  frais_htg: number;
  frais_usd: number | null;         // V5 — NULL = pas de tarif USD défini pour cette zone
  seuil_gratuit: number | null;
  delai_min_heures: number | null;  // V6
  delai_max_heures: number | null;  // V6
  actif: boolean;
}

// TODO (BDD): SELECT * FROM ZoneLivraison WHERE actif = TRUE ORDER BY frais_htg
const ZONES: ZoneLivraison[] = [
  { id: 1, nom_zone: 'Port-au-Prince centre', frais_htg: 150, frais_usd: 1.10, seuil_gratuit: 2000, delai_min_heures: 24, delai_max_heures: 24, actif: true },
  { id: 2, nom_zone: 'Pétion-Ville',          frais_htg: 200, frais_usd: 1.50, seuil_gratuit: 2000, delai_min_heures: 24, delai_max_heures: 24, actif: true },
  { id: 3, nom_zone: 'Zone métropolitaine',   frais_htg: 250, frais_usd: 1.90, seuil_gratuit: 2000, delai_min_heures: 24, delai_max_heures: 48, actif: true },
  { id: 4, nom_zone: 'Cap-Haïtien',           frais_htg: 350, frais_usd: 2.60, seuil_gratuit: 2000, delai_min_heures: 48, delai_max_heures: 72, actif: true },
  { id: 5, nom_zone: 'Jacmel',                frais_htg: 400, frais_usd: null, seuil_gratuit: 2000, delai_min_heures: 48, delai_max_heures: 72, actif: true },
  { id: 6, nom_zone: 'Les Cayes',             frais_htg: 400, frais_usd: null, seuil_gratuit: 2000, delai_min_heures: 48, delai_max_heures: 72, actif: true },
  { id: 7, nom_zone: 'Gonaïves',              frais_htg: 400, frais_usd: null, seuil_gratuit: 2000, delai_min_heures: 48, delai_max_heures: 72, actif: true },
  { id: 8, nom_zone: 'Saint-Marc',            frais_htg: 400, frais_usd: null, seuil_gratuit: 2000, delai_min_heures: 48, delai_max_heures: 72, actif: true },
  { id: 9, nom_zone: 'Autre ville',           frais_htg: 400, frais_usd: 3.00, seuil_gratuit: 2000, delai_min_heures: 48, delai_max_heures: 72, actif: true },
];

export async function GET() {
  return NextResponse.json({ zones: ZONES.filter((z) => z.actif) });
}
