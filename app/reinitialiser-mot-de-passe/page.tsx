'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const { lang } = useLanguageStore();
  const t = translations[lang].pages.resetPwd;

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
      setError(t.pwdTooShort);
      return;
    }
    if (form.password !== form.confirm) {
      setError(t.pwdMismatch);
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
      setError(data.error ?? t.pwdTooShort);
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
          {t.invalidHeading}
        </h2>
        <p className="font-lato text-sm text-gray-500 mb-6">
          {t.invalidDesc}
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="inline-block bg-primary hover:bg-pink-400 text-white font-lato font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
        >
          {t.requestNew}
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
          {t.successHeading}
        </h2>
        <p className="font-lato text-sm text-gray-500">
          {t.successDesc}
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
              {t.newPwd} <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={update('password')}
                placeholder={t.pwdPlaceholder}
                className="w-full pl-11 pr-11 py-3 border border-pink-200 rounded-xl font-lato text-sm outline-none focus:border-primary bg-gray-50 transition-colors"
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide' : 'Show'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">
              {t.confirm} <span className="text-primary">*</span>
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
                {t.updating}
              </>
            ) : (
              t.updateBtn
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { lang } = useLanguageStore();
  const t = translations[lang].pages.resetPwd;

  return (
    <div className="min-h-screen bg-[#F2E9E1] flex items-center justify-center px-4 py-16">
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
            {t.heading}
          </h1>
          <p className="font-lato text-sm text-gray-500">
            {t.sub}
          </p>
        </div>
        <Suspense fallback={<div className="flex justify-center py-20"><span className="w-8 h-8 border-4 border-pink-200 border-t-primary rounded-full animate-spin" /></div>}>
          <ResetForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
