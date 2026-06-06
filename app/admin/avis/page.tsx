'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, XCircle, Clock, ArrowLeft, Search, X } from 'lucide-react';

type Statut = 'en_attente' | 'publie' | 'refuse';

interface Avis {
  id: number;
  id_produit: number;
  nom_client: string;
  note: number;
  texte: string;
  date_creation: string;
  statut: Statut;
  commande_verifiee: boolean;
}

const STATUT_CFG: Record<Statut, { label: string; color: string; icon: React.ReactNode }> = {
  en_attente: { label: 'En attente', color: 'bg-amber-50 text-amber-600 border border-amber-100', icon: <Clock size={11} /> },
  publie:     { label: 'Publié',     color: 'bg-green-50 text-green-600 border border-green-100', icon: <CheckCircle size={11} /> },
  refuse:     { label: 'Refusé',     color: 'bg-red-50 text-red-500 border border-red-100',       icon: <XCircle size={11} /> },
};

function Stars({ note }: { note: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={12} className={i < note ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminAvisPage() {
  const [avis, setAvis] = useState<Avis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState<Statut | 'tous'>('en_attente');
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/avis')
      .then((r) => r.json())
      .then((d) => { setAvis(d.avis ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleAction = async (id: number, statut: Statut) => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/avis/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut }),
      });
      if (res.ok) {
        setAvis((prev) => prev.map((a) => (a.id === id ? { ...a, statut } : a)));
      }
    } finally {
      setProcessing(null);
    }
  };

  const counts: Record<Statut | 'tous', number> = {
    tous: avis.length,
    en_attente: avis.filter((a) => a.statut === 'en_attente').length,
    publie:     avis.filter((a) => a.statut === 'publie').length,
    refuse:     avis.filter((a) => a.statut === 'refuse').length,
  };

  const filtered = avis
    .filter((a) => filterStatut === 'tous' || a.statut === filterStatut)
    .filter((a) => !search || a.nom_client.toLowerCase().includes(search.toLowerCase()) || a.texte.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <div className="bg-white border-b border-pink-100 px-6 py-4 flex items-center gap-4"
        style={{ boxShadow: '0 1px 8px rgba(242,167,187,0.10)' }}>
        <Link href="/admin/dashboard"
          className="flex items-center gap-1.5 font-lato text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft size={15} /> Dashboard
        </Link>
        <div className="h-4 w-px bg-pink-100" />
        <div>
          <p className="font-playfair font-bold text-gray-800 text-lg leading-tight">Modération des avis</p>
          <p className="font-lato text-xs text-gray-400">{counts.en_attente} avis en attente de validation</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {([
            { key: 'en_attente', label: 'En attente' },
            { key: 'publie',     label: 'Publiés' },
            { key: 'refuse',     label: 'Refusés' },
            { key: 'tous',       label: 'Tous' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatut(tab.key)}
              className={`flex items-center gap-2 font-lato text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${
                filterStatut === tab.key
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-gray-500 border-pink-100 hover:border-primary hover:text-primary'
              }`}
            >
              {tab.label}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                filterStatut === tab.key ? 'bg-white/20 text-white' : 'bg-pink-50 text-gray-400'
              }`}>{counts[tab.key]}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par client ou texte…"
            className="w-full pl-10 pr-4 py-2.5 border border-pink-100 rounded-xl font-lato text-sm outline-none focus:border-primary bg-white transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X size={13} />
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-6 h-6 border-2 border-pink-200 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-pink-100 p-12 text-center">
            <div className="text-4xl mb-3">💕</div>
            <p className="font-playfair text-gray-400 text-lg">Aucun avis ici</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((a) => {
                const cfg = STATUT_CFG[a.statut];
                const isPending = processing === a.id;
                return (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl border border-pink-100 p-5"
                    style={{ boxShadow: '0 2px 16px rgba(242,167,187,0.09)' }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Left: review content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <p className="font-playfair font-semibold text-gray-800">{a.nom_client}</p>
                          <Stars note={a.note} />
                          {a.commande_verifiee && (
                            <span className="font-lato text-[10px] font-semibold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                              ✓ Achat vérifié
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 font-lato text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                            {cfg.icon}{cfg.label}
                          </span>
                        </div>
                        <p className="font-cormorant text-base text-gray-600 italic leading-relaxed mb-2">
                          &ldquo;{a.texte}&rdquo;
                        </p>
                        <p className="font-lato text-xs text-gray-400">{formatDate(a.date_creation)} · Produit #{a.id_produit}</p>
                      </div>

                      {/* Right: action buttons */}
                      <div className="flex sm:flex-col gap-2 shrink-0">
                        {a.statut !== 'publie' && (
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleAction(a.id, 'publie')}
                            disabled={isPending}
                            className="flex items-center gap-1.5 font-lato text-xs font-semibold text-white px-3.5 py-2 rounded-xl disabled:opacity-50 transition-colors"
                            style={{ background: 'linear-gradient(135deg,#22c55e,#4ade80)' }}
                          >
                            <CheckCircle size={12} />Publier
                          </motion.button>
                        )}
                        {a.statut !== 'refuse' && (
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleAction(a.id, 'refuse')}
                            disabled={isPending}
                            className="flex items-center gap-1.5 font-lato text-xs font-semibold text-white px-3.5 py-2 rounded-xl disabled:opacity-50 transition-colors"
                            style={{ background: 'linear-gradient(135deg,#ef4444,#f87171)' }}
                          >
                            <XCircle size={12} />Refuser
                          </motion.button>
                        )}
                        {a.statut !== 'en_attente' && (
                          <button
                            onClick={() => handleAction(a.id, 'en_attente')}
                            disabled={isPending}
                            className="font-lato text-[10px] text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors disabled:opacity-50"
                          >
                            Remettre en attente
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
