'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

const PAYS = [
  { id: 'HT', code: '+509', drapeau: '🇭🇹', nom: 'Haiti' },
  { id: 'US', code: '+1',   drapeau: '🇺🇸', nom: 'United States' },
  { id: 'CA', code: '+1',   drapeau: '🇨🇦', nom: 'Canada' },
  { id: 'FR', code: '+33',  drapeau: '🇫🇷', nom: 'France' },
  { id: 'MQ', code: '+596', drapeau: '🇲🇶', nom: 'Martinique' },
  { id: 'GP', code: '+590', drapeau: '🇬🇵', nom: 'Guadeloupe' },
  { id: 'DO', code: '+1',   drapeau: '🇩🇴', nom: 'Dominican Republic' },
  { id: 'BR', code: '+55',  drapeau: '🇧🇷', nom: 'Brazil' },
  { id: 'GB', code: '+44',  drapeau: '🇬🇧', nom: 'United Kingdom' },
];

export default function InscriptionPage() {
  const { lang } = useLanguageStore();
  const t = translations[lang].pages.register;

  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [selectedPaysId, setSelectedPaysId] = useState('HT');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const syncCartOnLogin = useCartStore((s) => s.syncCartOnLogin);
  const router = useRouter();

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prenom || !form.email || !phoneNumber.trim() || !form.password || !form.confirm) {
      setError(t.fillAll);
      return;
    }
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
    const pays = PAYS.find((p) => p.id === selectedPaysId)!;
    const fullPhone = `${pays.code} ${phoneNumber.trim()}`;
    await new Promise((r) => setTimeout(r, 900));
    login({
      name: form.prenom + (form.nom ? ' ' + form.nom : ''),
      email: form.email,
      telephone: fullPhone,
    });
    syncCartOnLogin();
    router.push('/');
  };

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

        <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">
                    {t.firstName} <span className="text-primary">*</span>
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
                    {t.lastName}
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
                  {t.email} <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="your@email.com"
                    className="w-full pl-11 pr-4 py-3 border border-pink-200 rounded-xl font-lato text-sm outline-none focus:border-primary bg-gray-50 transition-colors"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">
                  {t.whatsapp} <span className="text-primary">*</span>
                </label>
                <div className="flex border border-pink-200 rounded-xl overflow-hidden bg-gray-50 focus-within:border-primary transition-colors">
                  <select
                    value={selectedPaysId}
                    onChange={(e) => setSelectedPaysId(e.target.value)}
                    className="bg-transparent font-lato text-sm text-gray-700 pl-3 pr-2 py-3 outline-none border-r border-pink-200 cursor-pointer shrink-0"
                    aria-label={t.countryCode}
                  >
                    {PAYS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} {p.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="XXXX XXXX"
                    className="flex-1 px-3 py-3 font-lato text-sm outline-none bg-transparent min-w-0"
                    autoComplete="tel-national"
                  />
                </div>
              </div>

              <div>
                <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">
                  {t.pwd} <span className="text-primary">*</span>
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
                    {t.creating}
                  </>
                ) : (
                  t.createBtn
                )}
              </motion.button>
            </div>
          </form>

          <p className="text-center font-lato text-sm text-gray-500 mt-6">
            {t.haveAccount}{' '}
            <Link href="/connexion" className="text-primary font-semibold hover:underline">
              {t.signIn}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
