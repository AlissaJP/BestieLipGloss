'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

type PaiementStatut = 'en_attente' | 'validé' | 'refusé';

interface PaiementAdmin {
  id: number;
  id_commande: string;
  mode_paiement: 'moncash' | 'zelle';
  montant_paye: number | null;
  devise_paiement: 'HTG' | 'USD';
  reference_transaction: string | null;
  note_client: string | null;
  statut: PaiementStatut;
  date_paiement: string;
  date_validation: string | null;
  note_admin: string | null;
}

// TODO (BDD): SELECT p.*, c.numero_commande FROM Paiement p
//             JOIN Commande c ON p.id_commande = c.id
//             ORDER BY p.date_paiement DESC
const STUB_PAIEMENTS: PaiementAdmin[] = [
  {
    id: 1,
    id_commande: 'BES-2026-AB12',
    mode_paiement: 'moncash',
    montant_paye: 650,
    devise_paiement: 'HTG',
    reference_transaction: 'MC-9284729',
    note_client: 'Merci pour votre service !',
    statut: 'en_attente',
    date_paiement: new Date(Date.now() - 3600000).toISOString(),
    date_validation: null,
    note_admin: null,
  },
  {
    id: 2,
    id_commande: 'BES-2026-CD34',
    mode_paiement: 'zelle',
    montant_paye: 5.0,
    devise_paiement: 'USD',
    reference_transaction: null,
    note_client: null,
    statut: 'en_attente',
    date_paiement: new Date(Date.now() - 7200000).toISOString(),
    date_validation: null,
    note_admin: null,
  },
];

const STATUT_STYLE: Record<PaiementStatut, string> = {
  en_attente: 'bg-orange-100 text-orange-700',
  validé: 'bg-green-100 text-green-700',
  refusé: 'bg-red-100 text-red-600',
};

const STATUT_LABEL: Record<PaiementStatut, string> = {
  en_attente: 'En attente',
  validé: 'Validé',
  refusé: 'Refusé',
};

export default function AdminPaiementsPage() {
  const [paiements, setPaiements] = useState<PaiementAdmin[]>(STUB_PAIEMENTS);
  const [selected, setSelected] = useState<PaiementAdmin | null>(null);
  const [noteAdmin, setNoteAdmin] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterStatut, setFilterStatut] = useState<PaiementStatut | 'all'>('en_attente');

  const visible = filterStatut === 'all' ? paiements : paiements.filter((p) => p.statut === filterStatut);

  const handleDecision = async (decision: 'validé' | 'refusé') => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/paiement/${selected.id}/valider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, note_admin: noteAdmin || null }),
      });
      if (res.ok) {
        setPaiements((ps) => ps.map((p) => p.id === selected.id
          ? { ...p, statut: decision, note_admin: noteAdmin || null, date_validation: new Date().toISOString() }
          : p
        ));
        setSelected(null);
        setNoteAdmin('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 font-lato text-sm text-gray-500 hover:text-primary transition-colors mb-6">
          <ArrowLeft size={15} />Retour au dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-playfair font-bold text-2xl text-gray-800">Paiements</h1>
            <p className="font-lato text-sm text-gray-500 mt-0.5">Validation des preuves de paiement clients</p>
          </div>
          <div className="flex gap-2">
            {(['en_attente', 'validé', 'refusé', 'all'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatut(s)}
                className={`font-lato text-xs px-3 py-1.5 rounded-full transition-colors ${
                  filterStatut === s ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                }`}
              >
                {s === 'all' ? 'Tous' : STATUT_LABEL[s]}
                {s !== 'all' && (
                  <span className="ml-1.5 font-bold">{paiements.filter((p) => p.statut === s).length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {visible.length === 0 && (
            <div className="bg-white rounded-2xl border border-pink-100 p-10 text-center">
              <p className="font-lato text-gray-400 text-sm">Aucun paiement dans cette catégorie.</p>
            </div>
          )}
          {visible.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-pink-100 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-lato font-bold text-sm text-white flex-shrink-0"
                style={{ background: p.mode_paiement === 'moncash' ? '#ef4444' : '#7c3aed' }}>
                {p.mode_paiement === 'moncash' ? 'MC' : 'Z'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-playfair font-semibold text-gray-800">{p.id_commande}</p>
                  <span className={`font-lato text-xs font-semibold px-2 py-0.5 rounded-full ${STATUT_STYLE[p.statut]}`}>
                    {STATUT_LABEL[p.statut]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                  <p className="font-lato text-xs text-gray-500">
                    {p.montant_paye != null ? `${p.montant_paye} ${p.devise_paiement}` : 'Montant non renseigné'}
                  </p>
                  {p.reference_transaction && (
                    <p className="font-lato text-xs text-gray-400">Réf : {p.reference_transaction}</p>
                  )}
                  <p className="font-lato text-xs text-gray-400">
                    {new Date(p.date_paiement).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {p.note_client && (
                  <p className="font-lato text-xs text-gray-500 mt-1 italic">&ldquo;{p.note_client}&rdquo;</p>
                )}
                {p.note_admin && (
                  <p className="font-lato text-xs text-blue-600 mt-1">Note admin : {p.note_admin}</p>
                )}
              </div>
              {p.statut === 'en_attente' && (
                <button
                  onClick={() => { setSelected(p); setNoteAdmin(p.note_admin ?? ''); }}
                  className="flex-shrink-0 bg-primary hover:bg-pink-400 text-white font-lato text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  Traiter
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Decision modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={18} className="text-orange-400" />
                <h2 className="font-playfair font-bold text-lg text-gray-800">Valider le paiement</h2>
              </div>
              <p className="font-lato text-sm text-gray-600 mb-1">Commande : <span className="font-semibold text-gray-800">{selected.id_commande}</span></p>
              {selected.montant_paye != null && (
                <p className="font-lato text-sm text-gray-600 mb-1">Montant déclaré : <span className="font-semibold">{selected.montant_paye} {selected.devise_paiement}</span></p>
              )}
              {selected.reference_transaction && (
                <p className="font-lato text-sm text-gray-600 mb-4">Réf. : {selected.reference_transaction}</p>
              )}
              <div className="mt-4">
                <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">Note interne <span className="text-gray-400 font-normal">(optionnel)</span></label>
                <textarea
                  rows={3}
                  value={noteAdmin}
                  onChange={(e) => setNoteAdmin(e.target.value)}
                  placeholder="Ex. : Montant reçu confirmé sur MonCash…"
                  className="w-full font-lato text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setSelected(null)} className="flex-1 border border-gray-200 text-gray-600 font-lato text-sm py-2.5 rounded-xl hover:border-gray-300 transition-colors">
                  Annuler
                </button>
                <button
                  onClick={() => handleDecision('refusé')}
                  disabled={loading}
                  className="flex items-center gap-1.5 border-2 border-red-200 text-red-500 hover:bg-red-50 font-lato text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  <XCircle size={15} />Refuser
                </button>
                <button
                  onClick={() => handleDecision('validé')}
                  disabled={loading}
                  className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-white font-lato text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={15} />Valider
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
