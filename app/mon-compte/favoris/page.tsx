'use client';

import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';
import { useFavoritesStore } from '@/store/favoritesStore';
import ProductCard from '@/components/ProductCard';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

export default function FavorisPage() {
  const { items } = useFavoritesStore();
  const { lang } = useLanguageStore();
  const t = translations[lang].pages.favorites;

  return (
    <div className="min-h-screen bg-[#F2E9E1]">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link
          href="/mon-compte"
          className="inline-flex items-center gap-2 font-lato text-sm text-gray-500 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          {t.back}
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <h1 className="font-playfair font-bold text-3xl text-gray-800">{t.heading}</h1>
          {items.length > 0 && (
            <span className="bg-primary/10 text-primary font-lato text-sm font-semibold px-3 py-1 rounded-full">
              {items.length} {items.length > 1 ? t.products : t.product}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-pink-100 p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Heart size={28} className="text-red-300" />
            </div>
            <p className="font-playfair font-semibold text-gray-700 text-lg mb-2">
              {t.emptyHeading}
            </p>
            <p className="font-lato text-sm text-gray-400 max-w-xs mb-6">
              {t.emptyDesc}
            </p>
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 bg-primary hover:bg-pink-400 text-white font-lato font-semibold px-8 py-3 rounded-full transition-colors text-sm"
            >
              {t.explore}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
