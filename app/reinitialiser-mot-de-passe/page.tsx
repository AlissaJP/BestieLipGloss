'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setTokenValid(false); return; }
    fetch(`/api/mot-de-passe/request?token=${token}`)
      .then((r) => r.json())
      .then((d) => setTokenValid(d.valid === true))
      .catch(() => setTokenValid(false));
  }, [token]);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    const res = await fetch('/api/mot-de-passe/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: form.password }),
    });
    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Une erreur est survenue.');
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/connexion'), 3000);
  };

  if (tokenValid === null) {
    return (
      <div className="flex justify-center py-20">
        <span className="w-8 h-8 border-4 border-pink-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-10 text-center">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle size={32} className="text-red-400" />
          </div>
        </div>
        <h2 className="font-playfair font-bold text-xl text-gray-800 mb-3">
          Lien invalide ou expiré
        </h2>
        <p className="font-lato text-sm text-gray-500 mb-6">
          Ce lien de réinitialisation n&apos;est plus valide. Il a peut-être expiré (1 heure) ou déjà été utilisé.
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="inline-block bg-primary hover:bg-pink-400 text-white font-lato font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-10 text-center">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle size={32} className="text-green-500" />
          </div>
        </div>
        <h2 className="font-playfair font-bold text-2xl text-gray-800 mb-3">
          Mot de passe mis à jour !
        </h2>
        <p className="font-lato text-sm text-gray-500">
          Tu vas être redirigée vers la page de connexion dans 3 secondes…
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-8">
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <div>
            <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">
              Nouveau mot de passe <span className="text-primary">*</span>
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
                autoFocus
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
                Mise à jour…
              </>
            ) : (
              'Mettre à jour le mot de passe'
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
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
            Nouveau mot de passe
          </h1>
          <p className="font-lato text-sm text-gray-500">
            Choisis un nouveau mot de passe sécurisé
          </p>
        </div>
        <Suspense fallback={<div className="flex justify-center py-20"><span className="w-8 h-8 border-4 border-pink-200 border-t-primary rounded-full animate-spin" /></div>}>
          <ResetForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
