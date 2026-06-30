'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

export default function AdminLoginPage() {
  const { lang } = useLanguageStore();
  const t = translations[lang].admin.login;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isLoggedIn } = useAdminStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) router.replace('/admin/dashboard');
  }, [isLoggedIn, router]);

  const handleLogin = async () => {
    if (!username || !password) { setError(t.errorFillAll); return; }
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) {
      login();
      router.push('/admin/dashboard');
    } else {
      setError(t.errorInvalid);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #FFF0F4 0%, #FDF4EE 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #D45F85, #D4835A)' }}
          >
            <span className="text-3xl">💋</span>
          </div>
          <h1 className="font-playfair font-bold text-2xl text-gray-800">{t.heading}</h1>
          <p className="font-lato text-sm text-gray-400 mt-1">{t.sub}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-pink-50 p-8 space-y-5">
          {/* Username */}
          <div>
            <label className="font-lato text-xs text-gray-500 mb-1.5 block">{t.userLabel}</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                placeholder="admin"
                className="w-full pl-9 pr-4 py-3 border border-pink-100 rounded-xl font-lato text-sm outline-none focus:border-primary/50 bg-gray-50 transition-colors"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="font-lato text-xs text-gray-500 mb-1.5 block">{t.pwdLabel}</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-3 border border-pink-100 rounded-xl font-lato text-sm outline-none focus:border-primary/50 bg-gray-50 transition-colors"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="font-lato text-xs text-red-500 bg-red-50 px-3 py-2.5 rounded-xl border border-red-100">
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl font-lato font-bold text-sm text-white transition-all disabled:opacity-60 hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #D45F85, #D4835A)' }}
          >
            {loading ? t.loggingIn : t.loginBtn}
          </button>
        </div>

        <p className="text-center font-lato text-xs text-gray-300 mt-6">
          {t.footer}
        </p>
      </motion.div>
    </div>
  );
}
