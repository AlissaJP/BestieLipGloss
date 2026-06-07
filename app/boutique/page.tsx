'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { products as staticProducts } from '@/data/products';
import { useAdminStore } from '@/store/adminStore';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

type Filter = 'all' | 'artisanal' | 'bestseller';

export default function BoutiquePage() {
  const [filter, setFilter] = useState<Filter>('all');
  const { lang } = useLanguageStore();
  const t = translations[lang];
  const managedProducts = useAdminStore((s) => s.managedProducts);

  const catalog = (managedProducts.length > 0
    ? managedProducts.filter((p) => p.published)
    : staticProducts
  ).filter((p) => p.is_active !== false);

  const filtered = catalog.filter((p) => {
    if (filter === 'artisanal') return p.badge_type === 'artisanal' || p.badge.includes('Artisanal');
    if (filter === 'bestseller') return p.is_bestseller === true || p.badge.includes('Best-seller');
    return true;
  });

  const filterBtns: { value: Filter; label: string }[] = [
    { value: 'all', label: t.shop.filterAll },
    { value: 'bestseller', label: t.shop.filterBest },
    { value: 'artisanal', label: t.shop.filterArtisan },
  ];

  return (
    <div className="min-h-screen bg-[#F2E9E1]">
      {/* Page header */}
      <div
        className="py-16 px-4 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(212,95,133,0.30) 0%, rgba(201,164,122,0.50) 100%)',
        }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-lato text-xs tracking-widest text-gray-500 uppercase mb-2"
        >
          {t.shop.eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-playfair font-bold text-4xl sm:text-5xl text-gray-800 mb-3"
        >
          {t.shop.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-cormorant text-xl text-gray-600 italic"
        >
          {t.shop.subtitle}
        </motion.p>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex gap-3 flex-wrap">
          {filterBtns.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`font-lato text-sm px-5 py-2.5 rounded-full transition-all duration-200 min-h-[44px] ${
                filter === value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-pink-200 hover:border-primary hover:text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="max-w-7xl mx-auto px-4 py-10 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="font-playfair text-gray-400 text-xl">{t.shop.empty}</p>
          </div>
        )}
      </div>
    </div>
  );
}
