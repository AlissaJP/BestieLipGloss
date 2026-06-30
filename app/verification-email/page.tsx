'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, RefreshCw, PartyPopper } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

const OTP_LENGTH = 6;
const OTP_DURATION = 120;

function VerificationForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const { lang } = useLanguageStore();
  const t = translations[lang].pages.otp;

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(OTP_DURATION);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0 || status === 'success') return;
    const id = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [timeLeft, status]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const submitCode = async (code: string) => {
    if (status === 'loading' || status === 'success') return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const token = sessionStorage.getItem(`otp_token_${email}`) ?? '';
      const res = await fetch('/api/otp/verifier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, token }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setStatus('error');
        setErrorMsg(data.reason === 'expired' ? t.errorExpired : t.errorInvalid);
        const cleared = Array(OTP_LENGTH).fill('');
        setDigits(cleared);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
        return;
      }
      sessionStorage.removeItem(`otp_token_${email}`);
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg(t.errorNetwork);
      setDigits(Array(OTP_LENGTH).fill(''));
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (status === 'error') { setStatus('idle'); setErrorMsg(''); }
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (digit && next.every((d) => d !== '')) submitCode(next.join(''));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setDigits(pasted.split(''));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      submitCode(pasted);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    setDigits(Array(OTP_LENGTH).fill(''));
    setStatus('idle');
    setErrorMsg('');
    setTimeLeft(OTP_DURATION);
    try {
      const res = await fetch('/api/otp/envoyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? t.errorNetwork);
        setStatus('error');
        setTimeLeft(0);
      }
    } catch {
      setErrorMsg(t.errorNetwork);
      setStatus('error');
      setTimeLeft(0);
    }
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  const borderCls = (i: number) => {
    if (status === 'error') return 'border-red-400 bg-red-50 text-red-700';
    if (digits[i]) return 'border-primary bg-pink-50';
    return 'border-pink-200 bg-gray-50 focus:border-primary focus:bg-white';
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#F2E9E1] flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link href="/" className="font-greatvibes text-4xl text-primary inline-block mb-3">
              Bestie LipGloss
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mx-auto mb-6"
            >
              <PartyPopper size={36} className="text-primary" />
            </motion.div>

            <h2 className="font-playfair font-bold text-2xl text-gray-800 mb-3">
              {t.welcomeTitle}
            </h2>
            <p className="font-lato text-sm text-gray-500 leading-relaxed mb-8">
              {t.welcomeSub}
            </p>

            <Link
              href="/connexion"
              className="block w-full bg-primary hover:bg-pink-400 text-white font-lato font-semibold py-3.5 rounded-xl transition-colors text-sm text-center"
            >
              {t.continueBtn}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2E9E1] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="font-greatvibes text-4xl text-primary inline-block mb-3">
            Bestie LipGloss
          </Link>
          <h1 className="font-playfair font-bold text-2xl text-gray-800 mb-1">{t.heading}</h1>
          <p className="font-lato text-sm text-gray-500 px-4">
            {t.sub.replace('{email}', email)}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center">
              <Mail size={28} className="text-primary" />
            </div>
          </div>

          {/* OTP digit inputs */}
          <motion.div
            animate={status === 'error' ? { x: [-6, 6, -6, 6, 0] } : {}}
            transition={{ duration: 0.3 }}
            className="flex gap-2 justify-center mb-3"
            onPaste={handlePaste}
          >
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={status === 'loading'}
                className={`w-11 h-14 text-center font-playfair font-bold text-xl border-2 rounded-xl outline-none transition-all ${borderCls(i)} disabled:opacity-60`}
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </motion.div>

          {/* Status message */}
          <div className="min-h-[24px] text-center mb-4">
            <AnimatePresence mode="wait">
              {status === 'error' && errorMsg && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="font-lato text-sm text-red-500"
                >
                  {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Countdown */}
          <div className="text-center mb-5">
            {timeLeft > 0 ? (
              <p className="font-lato text-sm text-gray-500">
                {t.timerPrefix}{' '}
                <span className="font-semibold text-primary tabular-nums">
                  {formatTime(timeLeft)}
                </span>
              </p>
            ) : (
              <p className="font-lato text-sm text-amber-600 font-medium">{t.expired}</p>
            )}
          </div>

          {/* Verify button */}
          <button
            onClick={() => submitCode(digits.join(''))}
            disabled={digits.join('').length !== OTP_LENGTH || status === 'loading'}
            className="w-full bg-primary hover:bg-pink-400 disabled:opacity-50 text-white font-lato font-semibold py-3.5 rounded-xl transition-colors text-sm min-h-[48px] flex items-center justify-center gap-2 mb-5"
          >
            {status === 'loading' ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {t.verifying}
              </>
            ) : t.verifyBtn}
          </button>

          {/* Resend */}
          <div className="text-center">
            <p className="font-lato text-xs text-gray-400 mb-2">{t.noCode}</p>
            <button
              onClick={handleResend}
              disabled={timeLeft > 0}
              className="inline-flex items-center gap-1.5 font-lato text-sm font-semibold text-primary hover:underline disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw size={13} />
              {t.resend}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default function VerificationEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerificationForm />
    </Suspense>
  );
}
