'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function InscriptionPage() {
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const router = useRouter();

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prenom || !form.email || !form.password || !form.confirm) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setIsLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 900));
    login({
      name: form.prenom + (form.nom ? ' ' + form.nom : ''),
      email: form.email,
    });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="font-greatvibes text-4xl text-primary inline-block mb-3">
            Bestie LipGloss
          </Link>
          <h1 className="font-playfair font-bold text-2xl text-gray-800 mb-1">
            Rejoins la famille Bestie 💕
          </h1>
          <p className="font-lato text-sm text-gray-500">
            Crée ton compte en moins d&apos;une minute
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">
                    Prénom <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={form.prenom}
                      onChange={update('prenom')}
                      placeholder="Marie"
                      className="w-full pl-9 pr-3 py-3 border border-pink-200 rounded-xl font-lato text-sm outline-none focus:border-primary bg-gray-50 transition-colors"
                      autoComplete="given-name"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={update('nom')}
                    placeholder="Duval"
                    className="w-full px-4 py-3 border border-pink-200 rounded-xl font-lato text-sm outline-none focus:border-primary bg-gray-50 transition-colors"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div>
                <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">
                  Adresse e-mail <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="ton@email.com"
                    className="w-full pl-11 pr-4 py-3 border border-pink-200 rounded-xl font-lato text-sm outline-none focus:border-primary bg-gray-50 transition-colors"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">
                  Mot de passe <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={update('password')}
                    placeholder="Min. 6 caractères"
                    className="w-full pl-11 pr-11 py-3 border border-pink-200 rounded-xl font-lato text-sm outline-none focus:border-primary bg-gray-50 transition-colors"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">
                  Confirmer le mot de passe <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={update('confirm')}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 border border-pink-200 rounded-xl font-lato text-sm outline-none focus:border-primary bg-gray-50 transition-colors"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-lato text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary hover:bg-pink-400 disabled:opacity-70 text-white font-lato font-semibold py-3.5 rounded-xl transition-colors text-sm min-h-[48px] flex items-center justify-center gap-2 mt-1"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Création du compte…
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </motion.button>
            </div>
          </form>

          <p className="text-center font-lato text-sm text-gray-500 mt-6">
            Déjà un compte ?{' '}
            <Link href="/connexion" className="text-primary font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
