import { NextResponse } from 'next/server';

export interface ZoneLivraison {
  id: number;
  nom_zone: string;
  frais_htg: number;
  seuil_gratuit: number | null;
  actif: boolean;
}

// TODO (BDD): SELECT * FROM ZoneLivraison WHERE actif = TRUE ORDER BY frais_htg
const ZONES: ZoneLivraison[] = [
  { id: 1, nom_zone: 'Port-au-Prince centre', frais_htg: 150, seuil_gratuit: 2000, actif: true },
  { id: 2, nom_zone: 'Pétion-Ville',          frais_htg: 200, seuil_gratuit: 2000, actif: true },
  { id: 3, nom_zone: 'Zone métropolitaine',   frais_htg: 250, seuil_gratuit: 2000, actif: true },
  { id: 4, nom_zone: 'Cap-Haïtien',           frais_htg: 350, seuil_gratuit: 2000, actif: true },
  { id: 5, nom_zone: 'Jacmel',                frais_htg: 400, seuil_gratuit: 2000, actif: true },
  { id: 6, nom_zone: 'Les Cayes',             frais_htg: 400, seuil_gratuit: 2000, actif: true },
  { id: 7, nom_zone: 'Gonaïves',              frais_htg: 400, seuil_gratuit: 2000, actif: true },
  { id: 8, nom_zone: 'Saint-Marc',            frais_htg: 400, seuil_gratuit: 2000, actif: true },
  { id: 9, nom_zone: 'Autre ville',           frais_htg: 400, seuil_gratuit: 2000, actif: true },
];

export async function GET() {
  return NextResponse.json({ zones: ZONES.filter((z) => z.actif) });
}
