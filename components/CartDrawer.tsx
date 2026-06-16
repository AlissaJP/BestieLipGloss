'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

export default function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity } = useCartStore();
  const { lang } = useLanguageStore();
  const t = translations[lang];
  const totalUSD = items.reduce((acc, i) => acc + i.price_usd * i.quantity, 0);
  const totalHTG = items.reduce((acc, i) => acc + i.price_htg * i.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 z-50"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white z-50 flex flex-col shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Panier"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={22} className="text-primary" aria-hidden="true" />
                <h2 className="font-playfair font-semibold text-gray-800 text-xl">{t.cart.title}</h2>
                {items.length > 0 && (
                  <span className="bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {items.reduce((a, i) => a + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                  <span className="text-6xl" aria-hidden="true">💋</span>
                  <p className="font-playfair text-gray-500 text-xl">{t.cart.empty}</p>
                  <p className="font-lato text-base text-gray-400">{t.cart.emptyDesc}</p>
                  <button
                    onClick={closeCart}
                    className="mt-3 bg-primary text-white font-lato text-base px-6 py-2.5 rounded-full hover:bg-pink-400 transition-colors"
                  >
                    {t.cart.viewShop}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.variantKey} className="flex gap-3 p-3 bg-pink-50/60 rounded-xl">
                      {/* Thumbnail */}
                      {item.image ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-pink-50">
                          <Image
                            src={item.image}
                            alt={item.shade}
                            fill
                            className="object-cover object-center"
                            sizes="128px"
                            quality={90}
                          />
                        </div>
                      ) : (
                        <div
                          className={`${item.bgColor} w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl`}
                          aria-hidden="true"
                        >
                          💋
                        </div>
                      )}
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-playfair font-semibold text-gray-800 text-base truncate">{item.name}</p>
                        <span className="inline-block font-lato text-[11px] text-primary bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full mt-0.5">
                          {item.shade}
                        </span>
                        <p className="font-playfair font-bold text-primary text-base mt-1">
                          ${(item.price_usd * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      {/* Controls */}
                      <div className="flex flex-col items-end justify-between gap-1">
                        <button
                          onClick={() => removeItem(item.variantKey)}
                          className="text-gray-300 hover:text-red-400 transition-colors p-1"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(item.variantKey, item.quantity - 1)}
                            className="w-6 h-6 rounded-full border border-pink-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors"
                            aria-label={`Diminuer la quantité de ${item.name}`}
                          >
                            <Minus size={10} />
                          </button>
                          <span className="font-lato text-sm w-5 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.variantKey, item.quantity + 1)}
                            className="w-6 h-6 rounded-full border border-pink-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors"
                            aria-label={`Augmenter la quantité de ${item.name}`}
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-pink-100 space-y-3 bg-white">
                <div className="flex justify-between items-center">
                  <span className="font-lato text-gray-600 text-base">{t.cart.subtotal}</span>
                  <span className="font-playfair font-bold text-gray-800 text-2xl">${totalUSD.toFixed(2)}</span>
                </div>
                <p className="font-lato text-sm text-gray-400">
                  {totalHTG >= 2000 ? t.cart.freeShipping : t.cart.shippingLeft.replace('{n}', `$${((2000 - totalHTG) / 130).toFixed(2)}`)}
                </p>
                <Link
                  href="/panier"
                  onClick={closeCart}
                  className="block w-full text-center bg-primary hover:bg-pink-400 text-white font-lato font-semibold py-3 rounded-xl transition-colors min-h-[48px] flex items-center justify-center text-base"
                >
                  {t.cart.order}
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
