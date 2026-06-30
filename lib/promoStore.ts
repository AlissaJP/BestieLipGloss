type TypeReduction = 'pct' | 'fixe';

export interface CodePromo {
  id: number;
  code: string;
  reduction_pct: number;
  type_reduction: TypeReduction;
  date_expiration: string | null;
  nb_utilisations_max: number | null;
  nb_utilisations_actuel: number;
  montant_minimum: number | null;
  actif: boolean;
}

// TODO (BDD): remplacer par SELECT * FROM CodePromo
export const codePromoStore: CodePromo[] = [
  {
    id: 1, code: 'BESTIE10', reduction_pct: 0.10, type_reduction: 'pct',
    date_expiration: null, nb_utilisations_max: null, nb_utilisations_actuel: 0,
    montant_minimum: null, actif: true,
  },
  {
    id: 2, code: 'BESTIE15', reduction_pct: 0.15, type_reduction: 'pct',
    date_expiration: null, nb_utilisations_max: 100, nb_utilisations_actuel: 3,
    montant_minimum: 500, actif: true,
  },
];

// TODO (BDD): UPDATE CodePromo SET nb_utilisations_actuel = nb_utilisations_actuel + 1 WHERE code = ?
export function incrementPromoUsage(code: string): void {
  const promo = codePromoStore.find((p) => p.code === code.toUpperCase().trim());
  if (promo) promo.nb_utilisations_actuel++;
}

// TODO (BDD): INSERT INTO CodePromo (...) VALUES (...)
let nextId = codePromoStore.length + 1;
export function createPromo(data: Omit<CodePromo, 'id' | 'nb_utilisations_actuel'>): CodePromo {
  const promo: CodePromo = { ...data, id: nextId++, nb_utilisations_actuel: 0 };
  codePromoStore.push(promo);
  return promo;
}

// TODO (BDD): UPDATE CodePromo SET actif = ? WHERE id = ?
export function togglePromoActif(id: number): void {
  const promo = codePromoStore.find((p) => p.id === id);
  if (promo) promo.actif = !promo.actif;
}

// TODO (BDD): DELETE FROM CodePromo WHERE id = ?
export function deletePromo(id: number): void {
  const idx = codePromoStore.findIndex((p) => p.id === id);
  if (idx !== -1) codePromoStore.splice(idx, 1);
}
