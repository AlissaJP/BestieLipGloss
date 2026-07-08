'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, CheckCircle, XCircle, Tag, LogOut } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';
import type { CodePromo } from '@/lib/promoStore';

const inputCls = 'w-full font-lato text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary bg-white';

export default function AdminCouponsPage() {
  const router = useRouter();
  const { logout } = useAdminStore();
  const { lang } = useLanguageStore();
  const tc = translations[lang].admin.coupons;
  const ta = translations[lang].admin;

  const [coupons, setCoupons] = useState<CodePromo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '',
    type_reduction: 'pct' as 'pct' | 'fixe',
    reduction_pct: '',
    date_expiration: '',
    nb_utilisations_max: '',
    montant_minimum: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/promo/admin')
      .then((r) => r.json())
      .then((d) => { setCoupons(d.promos ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.code.trim() || !form.reduction_pct) {
      setError(tc.errorRequired);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/promo/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.toUpperCase().trim(),
          type_reduction: form.type_reduction,
          reduction_pct: form.type_reduction === 'pct'
            ? parseFloat(form.reduction_pct) / 100
            : parseFloat(form.reduction_pct),
          date_expiration: form.date_expiration || null,
          nb_utilisations_max: form.nb_utilisations_max ? parseInt(form.nb_utilisations_max) : null,
          montant_minimum: form.montant_minimum ? parseFloat(form.montant_minimum) * 130 : null,
          actif: true,
        }),
      });
      const data = await res.json() as { promo?: CodePromo; error?: string };
      if (!res.ok) { setError(data.error ?? tc.errorRequired); return; }
      if (data.promo) setCoupons((prev) => [...prev, data.promo!]);
      setShowForm(false);
      setForm({ code: '', type_reduction: 'pct', reduction_pct: '', date_expiration: '', nb_utilisations_max: '', montant_minimum: '' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number) => {
    await fetch('/api/promo/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, actif: !c.actif } : c));
  };

  const handleDelete = async (id: number) => {
    if (!confirm(tc.confirmDelete)) return;
    await fetch('/api/promo/admin', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    logout();
    router.push('/connexion');
  };

  return (
    <div className="min-h-screen bg-[#F2E9E1] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="inline-flex items-center gap-2 font-lato text-sm text-gray-500 hover:text-primary transition-colors"
          >
            <ArrowLeft size={15} />{tc.backDashboard}
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 font-lato text-sm text-gray-400 hover:text-red-500 transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
          >
            <LogOut size={14} />{ta.logout}
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-playfair font-bold text-2xl text-gray-800 flex items-center gap-2">
              <Tag size={20} className="text-primary" />{tc.title}
            </h1>
            <p className="font-lato text-sm text-gray-500 mt-0.5">{tc.subtitle}</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-pink-400 text-white font-lato text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={15} />{tc.newBtn}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 font-lato text-gray-400">{tc.loading}</div>
        ) : (
          <div className="space-y-3">
            {coupons.length === 0 && (
              <div className="bg-white rounded-2xl border border-pink-100 p-10 text-center">
                <p className="font-lato text-gray-400 text-sm">{tc.empty}</p>
              </div>
            )}
            {coupons.map((c) => (
              <div key={c.id} className={`bg-white rounded-2xl border-2 p-5 flex items-start gap-4 ${c.actif ? 'border-pink-100' : 'border-gray-100 opacity-60'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span className="font-playfair font-bold text-gray-800 text-base tracking-wider">{c.code}</span>
                    <span className={`font-lato text-xs font-semibold px-2.5 py-0.5 rounded-full ${c.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.actif ? tc.statusActive : tc.statusInactive}
                    </span>
                  </div>
                  <div className="font-lato text-sm text-gray-600 space-y-0.5">
                    <p>
                      {tc.labelReduction} <strong className="text-primary">
                        {c.type_reduction === 'pct'
                          ? `${Math.round(c.reduction_pct * 100)} %`
                          : `$${(c.reduction_pct / 130).toFixed(2)}`}
                      </strong>
                    </p>
                    {c.montant_minimum != null && (
                      <p className="text-gray-400 text-xs">{tc.labelMinOrder} ${(c.montant_minimum / 130).toFixed(2)}</p>
                    )}
                    {c.date_expiration && (
                      <p className="text-gray-400 text-xs">{tc.labelExpires} {new Date(c.date_expiration).toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'fr-FR')}</p>
                    )}
                    {c.nb_utilisations_max != null && (
                      <p className="text-gray-400 text-xs">
                        {tc.labelUsage} {c.nb_utilisations_actuel} / {c.nb_utilisations_max}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggle(c.id)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${c.actif ? 'bg-green-50 text-green-500 hover:bg-green-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                    title={c.actif ? tc.disableTitle : tc.enableTitle}
                  >
                    {c.actif ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="w-9 h-9 bg-red-50 text-red-400 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors"
                    title={tc.deleteTitle}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire de création */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <h2 className="font-playfair font-bold text-lg text-gray-800 mb-5">{tc.formTitle}</h2>
              <div className="space-y-4">
                <div>
                  <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">{tc.fieldCode} *</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className={inputCls}
                    placeholder="BESTIE20"
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">{tc.fieldType} *</label>
                  <select
                    value={form.type_reduction}
                    onChange={(e) => setForm((f) => ({ ...f, type_reduction: e.target.value as 'pct' | 'fixe' }))}
                    className={inputCls}
                  >
                    <option value="pct">{tc.typePct}</option>
                    <option value="fixe">{tc.typeFixed}</option>
                  </select>
                </div>
                <div>
                  <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">
                    {tc.fieldValue} * {form.type_reduction === 'pct' ? tc.valuePctHint : tc.valueFixedHint}
                  </label>
                  <input
                    type="number"
                    value={form.reduction_pct}
                    onChange={(e) => setForm((f) => ({ ...f, reduction_pct: e.target.value }))}
                    className={inputCls}
                    placeholder={form.type_reduction === 'pct' ? '10' : '5.00'}
                    min="0"
                    step={form.type_reduction === 'pct' ? '1' : '0.01'}
                  />
                </div>
                <div>
                  <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">
                    {tc.fieldMinOrder} <span className="text-gray-400 font-normal">{tc.optional}</span>
                  </label>
                  <input
                    type="number"
                    value={form.montant_minimum}
                    onChange={(e) => setForm((f) => ({ ...f, montant_minimum: e.target.value }))}
                    className={inputCls}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">
                    {tc.fieldMaxUses} <span className="text-gray-400 font-normal">{tc.maxUsesHint}</span>
                  </label>
                  <input
                    type="number"
                    value={form.nb_utilisations_max}
                    onChange={(e) => setForm((f) => ({ ...f, nb_utilisations_max: e.target.value }))}
                    className={inputCls}
                    placeholder="100"
                    min="1"
                  />
                </div>
                <div>
                  <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">
                    {tc.fieldExpiry} <span className="text-gray-400 font-normal">{tc.optional}</span>
                  </label>
                  <input
                    type="date"
                    value={form.date_expiration}
                    onChange={(e) => setForm((f) => ({ ...f, date_expiration: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                {error && <p className="font-lato text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowForm(false); setError(''); }}
                  className="flex-1 border border-gray-200 text-gray-600 font-lato text-sm py-2.5 rounded-xl hover:border-gray-300 transition-colors">
                  {tc.cancelBtn}
                </button>
                <button onClick={handleCreate} disabled={saving}
                  className="flex-1 bg-primary hover:bg-pink-400 disabled:opacity-50 text-white font-lato text-sm font-semibold py-2.5 rounded-xl transition-colors">
                  {saving ? tc.saving : tc.saveBtn}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
