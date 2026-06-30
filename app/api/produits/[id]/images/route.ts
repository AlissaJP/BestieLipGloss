import { NextRequest, NextResponse } from 'next/server';

export interface ImageProduit {
  id: number;
  id_produit: number;
  url: string;
  alt_text: string | null;
  ordre: number;
  est_principale: boolean;
}

// TODO (BDD):
// SELECT * FROM ImageProduit WHERE id_produit = ? ORDER BY ordre ASC
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const id_produit = parseInt(id, 10);
  if (isNaN(id_produit)) {
    return NextResponse.json({ error: 'ID invalide.' }, { status: 400 });
  }

  // Stub — returns empty until DB is connected.
  // Fallback: frontend uses Produit.image when this array is empty.
  return NextResponse.json({ images: [] as ImageProduit[] });
}
