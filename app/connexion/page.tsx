'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function ConnexionPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setIsLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 800));
    const raw = email.split('@')[0].replace(/[._-]/g, ' ');
    const name = raw.charAt(0).toUpperCase() + raw.slice(1);
    login({ name, email });
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
            Bon retour, Bestie 💕
          </h1>
          <p className="font-lato text-sm text-gray-500">
            Connecte-toi à ton espace personnel
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              <div>
                <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ton@email.com"
                    className="w-full pl-11 pr-4 py-3 border border-pink-200 rounded-xl font-lato text-sm outline-none focus:border-primary bg-gray-50 transition-colors"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-lato text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <a href="#" className="font-lato text-xs text-primary hover:underline">
                    Mot de passe oublié ?
                  </a>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 border border-pink-200 rounded-xl font-lato text-sm outline-none focus:border-primary bg-gray-50 transition-colors"
                    autoComplete="current-password"
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
                    Connexion en cours…
                  </>
                ) : (
                  'Se connecter'
                )}
              </motion.button>
            </div>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-pink-100" />
            <span className="font-lato text-xs text-gray-400">ou</span>
            <div className="flex-1 h-px bg-pink-100" />
          </div>

          <p className="text-center font-lato text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link href="/inscription" className="text-primary font-semibold hover:underline">
              S&apos;inscrire gratuitement
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
