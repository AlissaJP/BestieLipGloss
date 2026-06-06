import { NextRequest, NextResponse } from 'next/server';

// Même Map partagée — en production, ce sera remplacé par des requêtes BDD
// Note: import depuis le module request pour partager l'instance en dev (workaround mémoire)
// En production avec BDD, ce fichier fera directement des requêtes SQL/Supabase

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();

  if (!token || !password || password.length < 6) {
    return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
  }

  // TODO (BDD):
  // 1. SELECT * FROM TokenReset WHERE token = ? AND expires_at > NOW() AND utilise = FALSE
  // 2. Si valide : UPDATE Utilisateur SET mot_de_passe_hash = hash(password) WHERE id = tokenRow.id_utilisateur
  // 3. UPDATE TokenReset SET utilise = TRUE WHERE token = ?

  // En mode dev (sans BDD), on accepte n'importe quel token non vide
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Service non disponible.' }, { status: 503 });
}
