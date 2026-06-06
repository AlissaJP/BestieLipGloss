'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Minus, Plus, ArrowLeft, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';
import ProductCard from '@/components/ProductCard';
import type { Product, ColorVariant } from '@/data/products';

interface AvisPublie {
  id: number;
  nom_client: string;
  note: number;
  texte: string;
  date_creation: string;
  commande_verifiee: boolean;
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Il y a 1 jour';
  if (days < 7) return `Il y a ${days} jours`;
  if (days < 14) return 'Il y a 1 semaine';
  if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

interface Props {
  product: Product;
  related: Product[];
}

export default function ProductDetailClient({ product, related }: Props) {
  const [reviews, setReviews] = useState<AvisPublie[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [flyBalls, setFlyBalls] = useState<Array<{ id: number; x: number; y: number; tx: number; ty: number }>>([]);
  const [selectedVariant, setSelectedVariant] = useState<ColorVariant | null>(
    product.variants?.[0] ?? null
  );
  useEffect(() => {
    fetch(`/api/avis?id_produit=${product.id}&statut=publie`)
      .then((r) => r.json())
      .then((d) => setReviews(d.avis ?? []))
      .catch(() => {});
  }, [product.id]);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.note, 0) / reviews.length
    : 0;

  const { addItem } = useCartStore();
  const { isLoggedIn, openAuthModal } = useAuthStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { lang } = useLanguageStore();
  const t = translations[lang];
  const favorited = isFavorite(product.id);

  const handleToggleFavorite = () => {
    if (!isLoggedIn) { openAuthModal(); return; }
    toggleFavorite(product);
  };

  const images = [product.bgColor, ...product.bgColorMini];

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isLoggedIn) { openAuthModal(); return; }
    for (let i = 0; i < quantity; i++) {
      addItem({
        variantKey: selectedVariant ? `${product.id}::${selectedVariant.id}` : String(product.id),
        id: product.id,
        name: product.name,
        shade: selectedVariant?.name ?? product.shade,
        price_htg: product.price_htg,
        bgColor: selectedVariant?.bgColor ?? product.bgColor,
        image: selectedVariant?.image ?? product.introImage,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);

    const btnRect = e.currentTarget.getBoundingClientRect();
    const cartEl = document.querySelector('[aria-label^="Panier"]');
    if (cartEl) {
      const cartRect = cartEl.getBoundingClientRect();
      const id = Date.now();
      setFlyBalls(prev => [...prev, {
        id,
        x: btnRect.left + btnRect.width / 2,
        y: btnRect.top + btnRect.height / 2,
        tx: cartRect.left + cartRect.width / 2,
        ty: cartRect.top + cartRect.height / 2,
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Back link */}
        <Link href="/boutique"
          className="inline-flex items-center gap-2 font-lato text-sm text-gray-500 hover:text-primary transition-colors mb-8">
          <ArrowLeft size={15} />
          {t.product.backToShop}
        </Link>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            {(product.introImage || product.variants) ? (
              <>
                <motion.div
                  key={selectedVariant?.id ?? 'intro'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="relative rounded-3xl overflow-hidden h-80 sm:h-[420px] bg-pink-50 shadow-inner"
                >
                  <Image
                    src={selectedVariant?.image ?? product.introImage!}
                    alt={`${product.name}${selectedVariant ? ` – ${selectedVariant.name}` : ''}`}
                    fill
                    className="object-cover object-center"
                    priority
                  />
                </motion.div>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {product.variants?.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        selectedVariant?.id === variant.id
                          ? 'border-primary scale-105 shadow-md'
                          : 'border-transparent hover:border-pink-200'
                      }`}
                      aria-label={variant.name}
                    >
                      <Image src={variant.image} alt={variant.name} fill className="object-cover object-center" />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className={`${images[selectedImage]} rounded-3xl h-80 sm:h-[420px] flex items-center justify-center text-9xl shadow-inner`}
                  aria-label={`Image ${selectedImage + 1}`}
                >
                  💋
                </motion.div>
                <div className="flex gap-3">
                  {images.map((bg, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`${bg} w-20 h-20 rounded-xl flex items-center justify-center text-3xl border-2 transition-all ${
                        selectedImage === i ? 'border-primary scale-105 shadow-md' : 'border-transparent hover:border-pink-200'
                      }`}
                      aria-label={`Image ${i + 1}`}
                    >
                      💋
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            <span className="inline-block bg-pink-100 text-primary font-lato text-xs font-semibold px-3 py-1.5 rounded-full w-fit mb-3">
              {product.badge}
            </span>

            <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-gray-800 mb-4">{product.name}</h1>

            {/* Color variant selector */}
            {product.variants ? (
              <div className="mb-5">
                <p className="font-lato text-[11px] text-gray-400 uppercase tracking-widest mb-2.5">Teinte</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-lato text-sm transition-all border-2 ${
                        selectedVariant?.id === variant.id
                          ? 'border-primary bg-pink-50 text-primary font-semibold'
                          : 'border-pink-100 text-gray-600 hover:border-primary hover:text-primary'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${variant.bgColor}`} />
                      {variant.name}
                    </button>
                  ))}
                </div>
                <p className="font-cormorant text-lg text-gray-500 italic">{selectedVariant?.shade}</p>
              </div>
            ) : (
              <p className="font-cormorant text-lg text-gray-500 italic mb-5">{product.shade}</p>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-playfair font-bold text-3xl text-primary">{product.price_htg} HTG</span>
              <span className="font-lato text-sm text-gray-400">(${product.price_usd} USD)</span>
            </div>

            <p className="font-lato text-gray-600 leading-relaxed mb-6 text-sm sm:text-base">
              {selectedVariant?.description ?? product.description}
            </p>

            {/* Benefits */}
            <div className="mb-6">
              <h3 className="font-playfair font-semibold text-gray-800 mb-3">{t.product.benefits}</h3>
              <ul className="space-y-2">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2 font-lato text-sm text-gray-600">
                    <span className="text-primary font-bold">✓</span> {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Ingredients */}
            <div className="mb-8 p-5 bg-green-50 rounded-2xl border border-green-100">
              <h3 className="font-playfair font-semibold text-gray-800 mb-3">{t.product.ingredients}</h3>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ing) => (
                  <span key={ing} className="bg-white border border-green-200 text-green-700 font-lato text-xs px-3 py-1.5 rounded-full">
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Stock warning */}
            {product.stock < 10 && (
              <p className="font-lato text-sm text-orange-500 mb-4 flex items-center gap-1">
                ⚠️ {t.product.outOfStock} <strong>{product.stock}</strong> {t.product.stockWarning}
              </p>
            )}

            {/* Desktop quantity + add to cart */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-3 border border-pink-200 rounded-xl px-4 py-2.5 bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-500 hover:text-primary transition-colors" aria-label="Diminuer">
                  <Minus size={16} />
                </button>
                <span className="font-lato font-semibold w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="text-gray-500 hover:text-primary transition-colors" aria-label="Augmenter">
                  <Plus size={16} />
                </button>
              </div>
              <motion.button
                onClick={(e) => handleAddToCart(e)}
                whileTap={{ scale: 0.97 }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-lato font-semibold transition-all duration-300 min-h-[52px] ${
                  added ? 'bg-green-500 text-white' : 'bg-primary hover:bg-pink-400 text-white'
                }`}
              >
                <ShoppingBag size={18} />
                {added ? t.product.addedToCart : t.cart.add}
              </motion.button>
              <button
                onClick={handleToggleFavorite}
                className={`w-13 h-[52px] px-4 rounded-xl border-2 flex items-center justify-center transition-all ${
                  favorited ? 'border-red-400 bg-red-50 text-red-400' : 'border-pink-200 text-gray-400 hover:border-red-300 hover:text-red-400'
                }`}
                aria-label={favorited ? t.product.removeFav : t.product.addFav}
              >
                <Heart size={20} className={favorited ? 'fill-red-400' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="font-playfair font-bold text-2xl text-gray-800">
              {t.product.reviews} ({reviews.length})
            </h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="font-playfair font-bold text-3xl text-gray-800">{avgRating.toFixed(1)}</span>
                <div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < Math.round(avgRating) ? 'fill-accent text-accent' : 'text-gray-200'} aria-hidden="true" />
                    ))}
                  </div>
                  <p className="font-lato text-xs text-gray-400">{reviews.length} avis publiés</p>
                </div>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-pink-100 p-8 text-center">
              <p className="font-cormorant text-lg text-gray-400 italic">Aucun avis pour le moment — sois la première ! 💕</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl p-5 border border-pink-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-playfair font-semibold text-gray-800">{r.nom_client}</p>
                      <p className="font-lato text-xs text-gray-400">{relativeDate(r.date_creation)}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < r.note ? 'fill-accent text-accent' : 'text-gray-200'} aria-hidden="true" />
                      ))}
                    </div>
                  </div>
                  {r.commande_verifiee && (
                    <span className="inline-block font-lato text-[10px] font-semibold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full mb-2">
                      ✓ Achat vérifié
                    </span>
                  )}
                  <p className="font-cormorant text-base text-gray-600 italic leading-relaxed">
                    &ldquo;{r.texte}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related */}
        <section className="mt-16 pb-24 lg:pb-0">
          <h2 className="font-playfair font-bold text-2xl text-gray-800 mb-6">{t.product.related}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>

      {/* Mobile sticky add-to-cart */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 px-4 py-3 flex gap-2 z-30 shadow-lg">
        <div className="flex items-center gap-2 border border-pink-200 rounded-xl px-3 py-2 bg-white flex-shrink-0">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-500 hover:text-primary transition-colors" aria-label="Diminuer">
            <Minus size={15} />
          </button>
          <span className="font-lato font-semibold w-5 text-center text-sm">{quantity}</span>
          <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="text-gray-500 hover:text-primary transition-colors" aria-label="Augmenter">
            <Plus size={15} />
          </button>
        </div>
        <motion.button
          onClick={(e) => handleAddToCart(e)}
          whileTap={{ scale: 0.97 }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-lato font-semibold transition-all duration-300 min-h-[44px] text-sm ${
            added ? 'bg-green-500 text-white' : 'bg-primary hover:bg-pink-400 text-white'
          }`}
        >
          <ShoppingBag size={16} />
          {added ? t.cart.added : `${t.cart.addWith} ${product.price_htg * quantity} HTG`}
        </motion.button>
        <button
          onClick={handleToggleFavorite}
          className={`w-12 flex items-center justify-center rounded-xl border-2 transition-all flex-shrink-0 ${
            favorited ? 'border-red-400 bg-red-50 text-red-400' : 'border-pink-200 text-gray-400 hover:border-red-300 hover:text-red-400'
          }`}
          aria-label={favorited ? t.product.removeFav : t.product.addFav}
        >
          <Heart size={18} className={favorited ? 'fill-red-400' : ''} />
        </button>
      </div>

      {/* Fly-to-cart animation */}
      <AnimatePresence>
        {flyBalls.map(ball => (
          <motion.div
            key={ball.id}
            className="pointer-events-none z-[9999] rounded-full bg-primary shadow-md"
            style={{ position: 'fixed', left: ball.x - 12, top: ball.y - 12, width: 24, height: 24 }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: [0, (ball.tx - ball.x) * 0.35, ball.tx - ball.x],
              y: [0, -80, ball.ty - ball.y],
              scale: [1, 0.7, 0.25],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.72, times: [0, 0.42, 1], ease: 'easeInOut' }}
            onAnimationComplete={() => setFlyBalls(prev => prev.filter(b => b.id !== ball.id))}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
