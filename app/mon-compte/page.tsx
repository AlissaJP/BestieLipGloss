'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Star, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

export default function MonComptePage() {
  const { user } = useAuthStore();
  const { items: favoris } = useFavoritesStore();
  const { lang } = useLanguageStore();
  const t = translations[lang];

  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<'valid' | 'invalid' | null>(null);

  const handlePromo = () => {
    if (!promoCode.trim()) return;
    // Demo: accept "BESTIE10" as valid
    setPromoStatus(promoCode.toUpperCase() === 'BESTIE10' ? 'valid' : 'invalid');
    setTimeout(() => setPromoStatus(null), 3000);
  };

  const menuItems = [
    {
      icon: <ShoppingBag size={20} className="text-primary" />,
      title: t.account.myOrders,
      desc: t.account.myOrdersSub,
      href: '/mon-compte/commandes',
      bg: 'bg-pink-50',
    },
    {
      icon: <Heart size={20} className="text-red-400" />,
      title: t.account.myFavorites,
      desc: `${favoris.length} ${t.account.myFavoritesSub}`,
      href: '/mon-compte/favoris',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <div
        className="py-16 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, rgba(242,167,187,0.2) 0%, rgba(232,213,196,0.35) 100%)' }}
      >
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl select-none">
          👩🏾
        </div>
        <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-gray-800 mb-2">
          {user?.name ? `${t.account.hello}, ${user.name.split(' ')[0]} 💕` : 'Mon Compte'}
        </h1>
        <p className="font-cormorant text-xl text-gray-500 italic">{t.account.welcome}</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Promo code + Points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Promo code card — 2/3 width */}
          <motion.div
            whileHover={{ y: -2 }}
            className="sm:col-span-2 bg-white rounded-2xl p-5 border border-pink-100 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center">
                <span className="text-base">🏷️</span>
              </div>
              <h3 className="font-playfair font-semibold text-gray-800">{t.account.promoTitle}</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePromo()}
                placeholder={t.account.promoPlaceholder}
                className="flex-1 font-lato text-sm border border-pink-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary bg-gray-50 focus:bg-white transition-colors"
              />
              <button
                onClick={handlePromo}
                className="bg-primary text-white font-lato text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-pink-400 transition-colors whitespace-nowrap"
              >
                {t.account.promoApply}
              </button>
            </div>
            {promoStatus && (
              <p className={`font-lato text-xs mt-2.5 font-medium ${promoStatus === 'valid' ? 'text-green-600' : 'text-red-400'}`}>
                {promoStatus === 'valid' ? t.account.promoSaved : t.account.promoInvalid}
              </p>
            )}
          </motion.div>

          {/* Points — 1/3 width */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl p-5 border border-pink-100 text-center shadow-sm"
          >
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Star size={22} className="text-accent" />
            </div>
            <p className="font-playfair font-bold text-2xl text-gray-800">0</p>
            <p className="font-lato text-xs text-gray-500 mt-0.5">{t.account.points}</p>
          </motion.div>
        </div>

        {/* Reviews section */}
        <div className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
              <MessageSquare size={18} className="text-purple-500" />
            </div>
            <div>
              <h3 className="font-playfair font-semibold text-gray-800">{t.account.myReviews}</h3>
              <p className="font-lato text-xs text-gray-400">{t.account.myReviewsSub}</p>
            </div>
          </div>
          <div className="flex flex-col items-center py-6 gap-2 mt-2">
            <span className="text-3xl select-none">💬</span>
            <p className="font-playfair font-semibold text-gray-600 text-sm">{t.account.noReviews}</p>
            <p className="font-lato text-xs text-gray-400 text-center max-w-xs">{t.account.noReviewsDesc}</p>
          </div>
        </div>

        {/* Menu items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="bg-white rounded-2xl p-5 border border-pink-100 flex items-center gap-4 hover:border-primary transition-colors shadow-sm group"
            >
              <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-playfair font-semibold text-gray-800 group-hover:text-primary transition-colors text-sm">
                  {item.title}
                </p>
                <p className="font-lato text-xs text-gray-400 mt-0.5 leading-snug">{item.desc}</p>
              </div>
              <span className="text-gray-300 group-hover:text-primary transition-colors font-lato text-lg flex-shrink-0">›</span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 bg-primary hover:bg-pink-400 text-white font-lato font-semibold px-8 py-3.5 rounded-full transition-colors"
          >
            <ShoppingBag size={16} />
            {t.account.shopBtn}
          </Link>
        </div>
      </div>
    </div>
  );
}
