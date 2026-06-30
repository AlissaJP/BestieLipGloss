'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';
import type { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const { addItem, openCart } = useCartStore();
  const { isLoggedIn, openAuthModal } = useAuthStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { lang } = useLanguageStore();
  const t = translations[lang];

  const favorited = isFavorite(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) { openAuthModal(); return; }
    addItem({
      variantKey: String(product.id),
      id: product.id,
      name: product.name,
      shade: product.shade,
      price_htg: product.price_htg,
      price_usd: product.price_usd,
      bgColor: product.bgColor,
      image: product.image,
    });
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2200);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) { openAuthModal(); return; }
    toggleFavorite(product);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-pink-50 group flex flex-col"
    >
      <Link href={`/boutique/${product.slug}`} className="block flex-1">
        {/* Image */}
        <div className={`${product.image ? 'bg-gray-50' : product.bgColor} relative h-64 flex items-center justify-center overflow-hidden`}>
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <span className="text-7xl select-none" aria-hidden="true">💋</span>
          )}

          {/* Badge */}
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-sm font-lato font-semibold px-3 py-1 rounded-full text-gray-700 shadow-sm z-10">
            {product.badge}
          </span>

          {/* Favorite button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10"
            aria-label={favorited ? t.product.removeFav : t.product.addFav}
          >
            <Heart
              size={18}
              className={favorited ? 'fill-red-400 text-red-400' : 'text-gray-400'}
            />
          </button>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center z-10">
            <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" aria-hidden="true" />
          </div>
        </div>

        {/* Info */}
        <div className="p-5 pb-3">
          <p className="font-cormorant text-sm text-gray-400 italic mb-0.5">{product.shade}</p>
          <h3 className="font-playfair font-semibold text-gray-800 text-lg mb-1">{product.name}</h3>
          {product.stock < 10 && (
            <p className="font-lato text-xs text-orange-500 mb-1">⚠️ {t.product.outOfStock} {product.stock} {t.product.inStock}</p>
          )}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-playfair font-bold text-primary text-xl">${product.price_usd}</span>
          </div>
        </div>
      </Link>

      {/* Add to cart */}
      <div className="px-5 pb-5 pt-2">
        <motion.button
          onClick={handleAddToCart}
          whileTap={{ scale: 0.96 }}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-lato text-base font-semibold transition-all duration-300 min-h-[48px] ${
            added ? 'bg-green-500 text-white' : 'bg-primary hover:bg-pink-400 text-white'
          }`}
        >
          <ShoppingBag size={18} aria-hidden="true" />
          {added ? t.cart.added : t.cart.add}
        </motion.button>
      </div>
    </motion.div>
  );
}
