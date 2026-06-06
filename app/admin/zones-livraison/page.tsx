'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { ZoneLivraison } from '@/app/api/zones-livraison/route';

const inputCls = 'w-full font-lato text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary bg-white';

export default function AdminZonesLivraisonPage() {
  const [zones, setZones] = useState<ZoneLivraison[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ZoneLivraison | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom_zone: '', frais_htg: '', seuil_gratuit: '', actif: true });

  useEffect(() => {
    fetch('/api/zones-livraison')
      .then((r) => r.json())
      .then((d) => { setZones(d.zones ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nom_zone: '', frais_htg: '', seuil_gratuit: '', actif: true });
    setShowForm(true);
  };

  const openEdit = (zone: ZoneLivraison) => {
    setEditing(zone);
    setForm({
      nom_zone: zone.nom_zone,
      frais_htg: String(zone.frais_htg),
      seuil_gratuit: zone.seuil_gratuit != null ? String(zone.seuil_gratuit) : '',
      actif: zone.actif,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    // TODO (BDD): INSERT or UPDATE ZoneLivraison
    const payload: ZoneLivraison = {
      id: editing?.id ?? Date.now(),
      nom_zone: form.nom_zone.trim(),
      frais_htg: parseFloat(form.frais_htg) || 0,
      seuil_gratuit: form.seuil_gratuit ? parseFloat(form.seuil_gratuit) : null,
      actif: form.actif,
    };
    if (editing) {
      setZones((z) => z.map((x) => x.id === editing.id ? payload : x));
    } else {
      setZones((z) => [...z, payload]);
    }
    setShowForm(false);
  };

  const handleToggleActif = (zone: ZoneLivraison) => {
    // TODO (BDD): UPDATE ZoneLivraison SET actif = ? WHERE id = ?
    setZones((z) => z.map((x) => x.id === zone.id ? { ...x, actif: !x.actif } : x));
  };

  const handleDelete = (zone: ZoneLivraison) => {
    if (!confirm(`Supprimer la zone "${zone.nom_zone}" ?`)) return;
    // TODO (BDD): DELETE FROM ZoneLivraison WHERE id = ?
    setZones((z) => z.filter((x) => x.id !== zone.id));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 font-lato text-sm text-gray-500 hover:text-primary transition-colors mb-6">
          <ArrowLeft size={15} />Retour au dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-playfair font-bold text-2xl text-gray-800">Zones de livraison</h1>
            <p className="font-lato text-sm text-gray-500 mt-0.5">{zones.length} zone{zones.length !== 1 ? 's' : ''} configurée{zones.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-primary hover:bg-pink-400 text-white font-lato text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={15} />Ajouter
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 font-lato text-gray-400">Chargement…</div>
        ) : (
          <div className="space-y-3">
            {zones.map((zone) => (
              <div key={zone.id} className={`bg-white rounded-2xl p-4 border-2 flex items-center gap-4 ${zone.actif ? 'border-pink-100' : 'border-gray-100 opacity-60'}`}>
                <div className="flex-1 min-w-0">
                  <p className="font-playfair font-semibold text-gray-800">{zone.nom_zone}</p>
                  <p className="font-lato text-xs text-gray-500 mt-0.5">
                    {zone.frais_htg} HTG
                    {zone.seuil_gratuit != null && ` · gratuite dès ${zone.seuil_gratuit} HTG`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActif(zone)}
                    title={zone.actif ? 'Désactiver' : 'Activer'}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${zone.actif ? 'bg-green-50 text-green-500 hover:bg-green-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                  >
                    {zone.actif ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  </button>
                  <button
                    onClick={() => openEdit(zone)}
                    className="w-8 h-8 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors"
                    title="Modifier"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(zone)}
                    className="w-8 h-8 bg-red-50 text-red-400 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <h2 className="font-playfair font-bold text-lg text-gray-800 mb-5">
                {editing ? 'Modifier la zone' : 'Nouvelle zone'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">Nom de la zone</label>
                  <input value={form.nom_zone} onChange={(e) => setForm((f) => ({ ...f, nom_zone: e.target.value }))} className={inputCls} placeholder="Ex. : Port-au-Prince centre" />
                </div>
                <div>
                  <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">Frais de livraison (HTG)</label>
                  <input type="number" value={form.frais_htg} onChange={(e) => setForm((f) => ({ ...f, frais_htg: e.target.value }))} className={inputCls} placeholder="150" />
                </div>
                <div>
                  <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">Seuil livraison gratuite (HTG) <span className="text-gray-400 font-normal">— optionnel</span></label>
                  <input type="number" value={form.seuil_gratuit} onChange={(e) => setForm((f) => ({ ...f, seuil_gratuit: e.target.value }))} className={inputCls} placeholder="2000" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.actif} onChange={(e) => setForm((f) => ({ ...f, actif: e.target.checked }))} className="w-4 h-4 accent-primary" />
                  <span className="font-lato text-sm text-gray-700">Zone active</span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 font-lato text-sm py-2.5 rounded-xl hover:border-gray-300 transition-colors">Annuler</button>
                <button onClick={handleSave} disabled={!form.nom_zone || !form.frais_htg} className="flex-1 bg-primary hover:bg-pink-400 disabled:opacity-50 text-white font-lato text-sm font-semibold py-2.5 rounded-xl transition-colors">Enregistrer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
