'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function AuthModal() {
  const { showAuthModal, closeAuthModal } = useAuthStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAuthModal(); };
    if (showAuthModal) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showAuthModal, closeAuthModal]);

  return (
    <AnimatePresence>
      {showAuthModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
          >
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl select-none">
                💋
              </div>
              <h2
                id="auth-modal-title"
                className="font-playfair font-bold text-xl text-gray-800 mb-2"
              >
                Sign in to place an order
              </h2>
              <p className="font-lato text-sm text-gray-500 leading-relaxed mb-7">
                You need a Bestie account to add products to your cart and place an order. It&apos;s free and takes less than a minute!
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  href="/connexion"
                  onClick={closeAuthModal}
                  className="w-full bg-primary hover:bg-pink-400 text-white font-lato font-semibold py-3.5 rounded-xl transition-colors text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/inscription"
                  onClick={closeAuthModal}
                  className="w-full border-2 border-primary text-primary hover:bg-pink-50 font-lato font-semibold py-3.5 rounded-xl transition-colors text-sm"
                >
                  Create a free account
                </Link>
              </div>
              <p className="font-lato text-xs text-gray-400 mt-5">
                Less than a minute to join the Bestie family 💕
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
