'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Lock, MapPin, Plus, Trash2, Check, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, type Address } from '@/store/authStore';

const VILLES = [
  'Port-au-Prince',
  'Pétion-Ville',
  'Delmas',
  'Tabarre',
  'Carrefour',
  'Cap-Haïtien',
  'Gonaïves',
  'Les Cayes',
  'Jacmel',
  'Autre',
];

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-pink-50">
        <div className="w-9 h-9 bg-pink-50 rounded-xl flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <h2 className="font-playfair font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export default function InformationsPage() {
  const { user, updateUser, addAddress, removeAddress } = useAuthStore();

  /* — Identité — */
  const [editIdent, setEditIdent] = useState(false);
  const [identForm, setIdentForm] = useState({ name: user?.name ?? '', pseudo: user?.pseudo ?? '' });
  const saveIdent = () => {
    updateUser({ name: identForm.name, pseudo: identForm.pseudo });
    setEditIdent(false);
  };

  /* — Email — */
  const [editEmail, setEditEmail] = useState(false);
  const [emailForm, setEmailForm] = useState({ email: user?.email ?? '', confirm: '' });
  const [emailError, setEmailError] = useState('');
  const saveEmail = () => {
    if (!emailForm.email) { setEmailError('L\'email ne peut pas être vide.'); return; }
    if (emailForm.email !== emailForm.confirm) { setEmailError('Les emails ne correspondent pas.'); return; }
    updateUser({ email: emailForm.email });
    setEmailError('');
    setEditEmail(false);
  };

  /* — Mot de passe — */
  const [editPwd, setEditPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const savePwd = () => {
    if (!pwdForm.current) { setPwdError('Saisis ton mot de passe actuel.'); return; }
    if (pwdForm.next.length < 6) { setPwdError('Le nouveau mot de passe doit faire au moins 6 caractères.'); return; }
    if (pwdForm.next !== pwdForm.confirm) { setPwdError('Les mots de passe ne correspondent pas.'); return; }
    setPwdError('');
    setPwdSuccess(true);
    setTimeout(() => { setPwdSuccess(false); setEditPwd(false); setPwdForm({ current: '', next: '', confirm: '' }); }, 1800);
  };

  /* — Adresses — */
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: '', adresse: '', ville: '', quartier: '' });
  const [addrError, setAddrError] = useState('');
  const saveAddress = () => {
    if (!addrForm.label || !addrForm.adresse || !addrForm.ville) {
      setAddrError('Remplis les champs obligatoires (*).');
      return;
    }
    addAddress({ id: Date.now().toString(), ...addrForm });
    setAddrForm({ label: '', adresse: '', ville: '', quartier: '' });
    setAddrError('');
    setShowAddAddr(false);
  };

  const inputCls = 'w-full px-4 py-3 border border-pink-200 rounded-xl font-lato text-sm outline-none focus:border-primary bg-gray-50 transition-colors';
  const btnSave = 'flex items-center gap-1.5 bg-primary hover:bg-pink-400 text-white font-lato text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors';
  const btnCancel = 'font-lato text-sm text-gray-400 hover:text-gray-600 transition-colors px-4 py-2.5';

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link
          href="/mon-compte"
          className="inline-flex items-center gap-2 font-lato text-sm text-gray-500 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Retour à mon compte
        </Link>

        <h1 className="font-playfair font-bold text-3xl text-gray-800 mb-8">Mes informations</h1>

        <div className="space-y-4">

          {/* — Identité — */}
          <Section icon={<User size={17} className="text-primary" />} title="Identité">
            {!editIdent ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-lato text-sm text-gray-700">
                    <span className="text-gray-400 mr-2">Nom :</span>{user?.name || '—'}
                  </p>
                  <p className="font-lato text-sm text-gray-700 mt-1">
                    <span className="text-gray-400 mr-2">Pseudo :</span>
                    {user?.pseudo || <span className="text-gray-300 italic">Non défini</span>}
                  </p>
                </div>
                <button onClick={() => { setIdentForm({ name: user?.name ?? '', pseudo: user?.pseudo ?? '' }); setEditIdent(true); }}
                  className="font-lato text-sm text-primary hover:underline">
                  Modifier
                </button>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div>
                    <label className="font-lato text-xs text-gray-500 mb-1 block">Nom complet</label>
                    <input className={inputCls} value={identForm.name}
                      onChange={e => setIdentForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="font-lato text-xs text-gray-500 mb-1 block">Pseudo</label>
                    <input className={inputCls} placeholder="Ex. : BestieQueen" value={identForm.pseudo}
                      onChange={e => setIdentForm(p => ({ ...p, pseudo: e.target.value }))} />
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <button onClick={saveIdent} className={btnSave}><Check size={14} />Sauvegarder</button>
                    <button onClick={() => setEditIdent(false)} className={btnCancel}>Annuler</button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </Section>

          {/* — Email — */}
          <Section icon={<Mail size={17} className="text-primary" />} title="Adresse e-mail">
            {!editEmail ? (
              <div className="flex items-center justify-between">
                <p className="font-lato text-sm text-gray-700">{user?.email || '—'}</p>
                <button onClick={() => { setEmailForm({ email: user?.email ?? '', confirm: '' }); setEmailError(''); setEditEmail(true); }}
                  className="font-lato text-sm text-primary hover:underline">
                  Modifier
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div>
                  <label className="font-lato text-xs text-gray-500 mb-1 block">Nouvel e-mail</label>
                  <input type="email" className={inputCls} value={emailForm.email}
                    onChange={e => setEmailForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label className="font-lato text-xs text-gray-500 mb-1 block">Confirmer l&apos;e-mail</label>
                  <input type="email" className={inputCls} value={emailForm.confirm}
                    onChange={e => setEmailForm(p => ({ ...p, confirm: e.target.value }))} />
                </div>
                {emailError && <p className="font-lato text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{emailError}</p>}
                <div className="flex items-center gap-3 pt-1">
                  <button onClick={saveEmail} className={btnSave}><Check size={14} />Sauvegarder</button>
                  <button onClick={() => setEditEmail(false)} className={btnCancel}>Annuler</button>
                </div>
              </motion.div>
            )}
          </Section>

          {/* — Mot de passe — */}
          <Section icon={<Lock size={17} className="text-primary" />} title="Mot de passe">
            {!editPwd ? (
              <div className="flex items-center justify-between">
                <p className="font-lato text-sm text-gray-400 tracking-widest">••••••••</p>
                <button onClick={() => { setPwdError(''); setPwdSuccess(false); setEditPwd(true); }}
                  className="font-lato text-sm text-primary hover:underline">
                  Modifier
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {['current', 'next', 'confirm'].map((field, i) => (
                  <div key={field}>
                    <label className="font-lato text-xs text-gray-500 mb-1 block">
                      {field === 'current' ? 'Mot de passe actuel' : field === 'next' ? 'Nouveau mot de passe' : 'Confirmer le nouveau'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPwd ? 'text' : 'password'}
                        className={inputCls + ' pr-11'}
                        value={pwdForm[field as keyof typeof pwdForm]}
                        onChange={e => setPwdForm(p => ({ ...p, [field]: e.target.value }))}
                        placeholder="••••••••"
                      />
                      {i === 0 && (
                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {pwdError && <p className="font-lato text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{pwdError}</p>}
                {pwdSuccess && <p className="font-lato text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">✓ Mot de passe mis à jour !</p>}
                <div className="flex items-center gap-3 pt-1">
                  <button onClick={savePwd} className={btnSave}><Check size={14} />Sauvegarder</button>
                  <button onClick={() => setEditPwd(false)} className={btnCancel}>Annuler</button>
                </div>
              </motion.div>
            )}
          </Section>

          {/* — Adresses de livraison — */}
          <Section icon={<MapPin size={17} className="text-primary" />} title="Adresses de livraison">
            <div className="space-y-3 mb-4">
              {(user?.addresses ?? []).length === 0 && !showAddAddr && (
                <p className="font-lato text-sm text-gray-400 italic">Aucune adresse enregistrée.</p>
              )}
              {(user?.addresses ?? []).map((addr) => (
                <div key={addr.id} className="flex items-start justify-between gap-3 p-4 bg-pink-50/60 rounded-xl border border-pink-100">
                  <div>
                    <p className="font-lato text-sm font-semibold text-gray-800">{addr.label}</p>
                    <p className="font-lato text-xs text-gray-500 mt-0.5">{addr.adresse}</p>
                    <p className="font-lato text-xs text-gray-500">{addr.quartier ? `${addr.quartier}, ` : ''}{addr.ville}</p>
                  </div>
                  <button onClick={() => removeAddress(addr.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {showAddAddr && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-3 mb-4 p-4 bg-gray-50 rounded-xl border border-pink-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="font-lato text-xs text-gray-500 mb-1 block">Libellé <span className="text-primary">*</span></label>
                      <input className={inputCls} placeholder="Ex. : Maison, Travail…" value={addrForm.label}
                        onChange={e => setAddrForm(p => ({ ...p, label: e.target.value }))} />
                    </div>
                    <div className="col-span-2">
                      <label className="font-lato text-xs text-gray-500 mb-1 block">Adresse <span className="text-primary">*</span></label>
                      <input className={inputCls} placeholder="Rue, numéro…" value={addrForm.adresse}
                        onChange={e => setAddrForm(p => ({ ...p, adresse: e.target.value }))} />
                    </div>
                    <div>
                      <label className="font-lato text-xs text-gray-500 mb-1 block">Ville <span className="text-primary">*</span></label>
                      <select className={inputCls} value={addrForm.ville}
                        onChange={e => setAddrForm(p => ({ ...p, ville: e.target.value }))}>
                        <option value="">Choisir…</option>
                        {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="font-lato text-xs text-gray-500 mb-1 block">Quartier</label>
                      <input className={inputCls} placeholder="Optionnel" value={addrForm.quartier}
                        onChange={e => setAddrForm(p => ({ ...p, quartier: e.target.value }))} />
                    </div>
                  </div>
                  {addrError && <p className="font-lato text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{addrError}</p>}
                  <div className="flex items-center gap-3">
                    <button onClick={saveAddress} className={btnSave}><Check size={14} />Ajouter</button>
                    <button onClick={() => { setShowAddAddr(false); setAddrError(''); }} className={btnCancel}>Annuler</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showAddAddr && (
              <button onClick={() => setShowAddAddr(true)}
                className="inline-flex items-center gap-2 font-lato text-sm text-primary hover:underline">
                <Plus size={15} />
                Ajouter une adresse
              </button>
            )}
          </Section>

        </div>
      </div>
    </div>
  );
}
