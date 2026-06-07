'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

const STATUS_STYLES: Record<string, { emoji: string; pill: string; active: string; dot: string }> = {
  attente:  { emoji: '⏳', pill: 'bg-orange-100 text-orange-700', active: 'bg-orange-500 text-white shadow-sm shadow-orange-200', dot: 'bg-orange-400' },
  valide:   { emoji: '✅', pill: 'bg-blue-100 text-blue-700',   active: 'bg-blue-500 text-white shadow-sm shadow-blue-200',   dot: 'bg-blue-400' },
  livraison:{ emoji: '🛵', pill: 'bg-purple-100 text-purple-700',active: 'bg-purple-500 text-white shadow-sm shadow-purple-200',dot: 'bg-purple-400' },
  livre:    { emoji: '💕', pill: 'bg-green-100 text-green-700', active: 'bg-green-500 text-white shadow-sm shadow-green-200', dot: 'bg-green-400' },
  annule:   { emoji: '🚫', pill: 'bg-gray-100 text-gray-500',   active: 'bg-gray-500 text-white shadow-sm shadow-gray-200',   dot: 'bg-gray-400' },
};

const STATUS_KEYS = ['attente', 'valide', 'livraison', 'livre', 'annule'] as const;
type StatusKey = typeof STATUS_KEYS[number];

export default function CommandesPage() {
  const { lang } = useLanguageStore();
  const t = translations[lang].pages.orders;
  const tStatuses = t.statuses;

  const [activeTab, setActiveTab] = useState<StatusKey>('attente');
  const activeStyle = STATUS_STYLES[activeTab];
  const activeLabel = tStatuses[activeTab].label;
  const activeDesc = tStatuses[activeTab].desc;

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          href="/mon-compte"
          className="inline-flex items-center gap-2 font-lato text-sm text-gray-500 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          {t.back}
        </Link>

        <h1 className="font-playfair font-bold text-3xl text-gray-800 mb-2">{t.heading}</h1>
        <p className="font-lato text-sm text-gray-500 mb-8">{t.sub}</p>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {STATUS_KEYS.map((key) => {
            const style = STATUS_STYLES[key];
            const label = tStatuses[key].label;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-lato text-sm font-medium transition-all ${
                  activeTab === key ? style.active : style.pill + ' hover:opacity-75'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    activeTab === key ? 'bg-white/60' : style.dot
                  }`}
                />
                {label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded-2xl border border-pink-100 p-10 flex flex-col items-center text-center">
              <span className="text-4xl mb-4 select-none">{activeStyle.emoji}</span>
              <p className="font-playfair font-semibold text-gray-700 text-lg mb-2">
                No &ldquo;{activeLabel}&rdquo; orders
              </p>
              <p className="font-lato text-sm text-gray-400 max-w-xs">
                {activeDesc}. Your orders will appear here as you make purchases.
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="text-center mt-10">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 bg-primary hover:bg-pink-400 text-white font-lato font-semibold px-8 py-3.5 rounded-full transition-colors"
          >
            <ShoppingBag size={16} />
            {t.shopBtn}
          </Link>
        </div>
      </div>
    </div>
  );
}
