import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  // TODO (BDD): vérifier la session utilisateur (cookie/JWT)
  // TODO (BDD):
  //   SELECT pi.id, pi.quantite, pi.date_ajout,
  //          vp.id as id_variant, vp.nom_variante, vp.bg_color, vp.image_url, vp.stock,
  //          p.id as id_produit, p.nom, p.prix_htg, p.slug
  //   FROM PanierItem pi
  //   JOIN VariantProduit vp ON vp.id = pi.id_variant
  //   JOIN Produit p ON p.id = vp.id_produit
  //   JOIN Panier pan ON pan.id = pi.id_panier
  //   WHERE pan.id_utilisateur = :userId

  return NextResponse.json({ items: [] });
}

export async function DELETE(_request: NextRequest) {
  // TODO (BDD): DELETE FROM PanierItem WHERE id_panier = panier de l'utilisateur
  return NextResponse.json({ success: true });
}
