'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    setError('');

    const res = await fetch('/api/mot-de-passe/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'An error occurred.');
      return;
    }

    if (data.devToken) setDevToken(data.devToken);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-10">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle size={32} className="text-green-500" />
              </div>
            </div>
            <h1 className="font-playfair font-bold text-2xl text-gray-800 mb-3">
              Email sent!
            </h1>
            <p className="font-lato text-sm text-gray-500 mb-6">
              If an account exists for <strong>{email}</strong>, you will receive a reset link in a few minutes. Remember to check your spam folder.
            </p>

            {devToken && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                <p className="font-lato text-xs font-semibold text-amber-700 mb-2">
                  Development mode — test link:
                </p>
                <Link
                  href={`/reinitialiser-mot-de-passe?token=${devToken}`}
                  className="font-lato text-xs text-amber-700 break-all hover:underline"
                >
                  /reinitialiser-mot-de-passe?token={devToken.slice(0, 20)}…
                </Link>
              </div>
            )}

            <Link
              href="/connexion"
              className="inline-flex items-center gap-2 font-lato text-sm text-primary font-semibold hover:underline"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

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
            Forgot your password?
          </h1>
          <p className="font-lato text-sm text-gray-500">
            Enter your email address and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              <div>
                <label className="font-lato text-sm font-medium text-gray-700 block mb-1.5">
                  Email address <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-11 pr-4 py-3 border border-pink-200 rounded-xl font-lato text-sm outline-none focus:border-primary bg-gray-50 transition-colors"
                    autoComplete="email"
                    autoFocus
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
                className="w-full bg-primary hover:bg-pink-400 disabled:opacity-70 text-white font-lato font-semibold py-3.5 rounded-xl transition-colors text-sm min-h-[48px] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  'Send reset link'
                )}
              </motion.button>
            </div>
          </form>

          <p className="text-center font-lato text-sm text-gray-500 mt-6">
            <Link href="/connexion" className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline">
              <ArrowLeft size={13} />
              Back to sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
