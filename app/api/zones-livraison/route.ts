import { NextResponse } from 'next/server';

export interface ZoneLivraison {
  id: number;
  nom_zone: string;
  pays: 'hti' | 'usa';
  // Standard
  frais_htg: number;
  frais_usd: number | null;
  seuil_gratuit: number | null;    // Standard peut être gratuit au-dessus de ce seuil
  delai_min_heures: number | null;
  delai_max_heures: number | null;
  // Express
  frais_express_htg: number | null;   // null = express non disponible pour cette zone
  frais_express_usd: number | null;
  delai_express_heures: number | null; // Délai express en heures (valeur unique)
  actif: boolean;
}

// TODO (BDD): SELECT * FROM ZoneLivraison WHERE actif = TRUE ORDER BY pays, frais_htg
const ZONES: ZoneLivraison[] = [
  // ——— Haïti ———
  {
    id: 1, nom_zone: 'Port-au-Prince centre', pays: 'hti',
    frais_htg: 150, frais_usd: 1.10, seuil_gratuit: 2000,
    delai_min_heures: 24, delai_max_heures: 24,
    frais_express_htg: 400, frais_express_usd: 3.10, delai_express_heures: 4,
    actif: true,
  },
  {
    id: 2, nom_zone: 'Pétion-Ville', pays: 'hti',
    frais_htg: 200, frais_usd: 1.50, seuil_gratuit: 2000,
    delai_min_heures: 24, delai_max_heures: 24,
    frais_express_htg: 450, frais_express_usd: 3.50, delai_express_heures: 6,
    actif: true,
  },
  {
    id: 3, nom_zone: 'Zone métropolitaine', pays: 'hti',
    frais_htg: 250, frais_usd: 1.90, seuil_gratuit: 2000,
    delai_min_heures: 24, delai_max_heures: 48,
    frais_express_htg: 550, frais_express_usd: 4.25, delai_express_heures: 8,
    actif: true,
  },
  {
    id: 4, nom_zone: 'Cap-Haïtien', pays: 'hti',
    frais_htg: 350, frais_usd: 2.60, seuil_gratuit: 2000,
    delai_min_heures: 48, delai_max_heures: 72,
    frais_express_htg: 700, frais_express_usd: 5.40, delai_express_heures: 24,
    actif: true,
  },
  {
    id: 5, nom_zone: 'Jacmel', pays: 'hti',
    frais_htg: 400, frais_usd: null, seuil_gratuit: 2000,
    delai_min_heures: 48, delai_max_heures: 72,
    frais_express_htg: 800, frais_express_usd: null, delai_express_heures: 24,
    actif: true,
  },
  {
    id: 6, nom_zone: 'Les Cayes', pays: 'hti',
    frais_htg: 400, frais_usd: null, seuil_gratuit: 2000,
    delai_min_heures: 48, delai_max_heures: 72,
    frais_express_htg: 800, frais_express_usd: null, delai_express_heures: 24,
    actif: true,
  },
  {
    id: 7, nom_zone: 'Gonaïves', pays: 'hti',
    frais_htg: 400, frais_usd: null, seuil_gratuit: 2000,
    delai_min_heures: 48, delai_max_heures: 72,
    frais_express_htg: 800, frais_express_usd: null, delai_express_heures: 24,
    actif: true,
  },
  {
    id: 8, nom_zone: 'Saint-Marc', pays: 'hti',
    frais_htg: 400, frais_usd: null, seuil_gratuit: 2000,
    delai_min_heures: 48, delai_max_heures: 72,
    frais_express_htg: 800, frais_express_usd: null, delai_express_heures: 24,
    actif: true,
  },
  {
    id: 9, nom_zone: 'Autre ville', pays: 'hti',
    frais_htg: 400, frais_usd: 3.00, seuil_gratuit: 2000,
    delai_min_heures: 48, delai_max_heures: 72,
    frais_express_htg: 800, frais_express_usd: 6.15, delai_express_heures: 24,
    actif: true,
  },
  // ——— États-Unis ———
  {
    id: 10, nom_zone: 'USA Standard', pays: 'usa',
    frais_htg: 3500, frais_usd: 26.90, seuil_gratuit: null,
    delai_min_heures: 168, delai_max_heures: 336,  // 7–14 jours
    frais_express_htg: 6500, frais_express_usd: 50.00, delai_express_heures: 72,  // 3 jours
    actif: true,
  },
];

export async function GET() {
  return NextResponse.json({ zones: ZONES.filter((z) => z.actif) });
}
