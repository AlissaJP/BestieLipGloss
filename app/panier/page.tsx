'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Trash2, Plus, Minus, ShoppingBag, Tag, Upload, CheckCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import CheckoutStepper from '@/components/CheckoutStepper';

// ——— Delivery fees per city ———
const CITY_FEES: Record<string, number> = {
  'Port-au-Prince centre': 150,
  'Pétion-Ville': 200,
  'Zone métropolitaine': 250,
  'Cap-Haïtien': 350,
  'Jacmel': 400,
  'Les Cayes': 400,
  'Gonaïves': 400,
  'Saint-Marc': 400,
  'Autre ville': 400,
};

const PROMO_CODES: Record<string, number> = {
  BESTIE10: 0.1,
  BESTIE15: 0.15,
};

type DeliveryFormData = {
  prenom: string;
  nom: string;
  adresse: string;
  ville: string;
  quartier: string;
  whatsapp: string;
};

export default function PanierPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();

  const [step, setStep] = useState(0); // 0=cart, 1=delivery, 2=payment, 3=success
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [selectedCity, setSelectedCity] = useState('Port-au-Prince centre');
  const [paymentMethod, setPaymentMethod] = useState<'moncash' | 'zelle'>('moncash');
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryFormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryFormData>();

  const subtotal = totalPrice();
  const discountAmount = Math.round(subtotal * promoDiscount);
  const discountedSubtotal = subtotal - discountAmount;
  const deliveryFee = discountedSubtotal >= 2000 ? 0 : CITY_FEES[selectedCity] ?? 400;
  const total = discountedSubtotal + deliveryFee;

  const applyPromo = () => {
    const code = promoCode.toUpperCase().trim();
    if (PROMO_CODES[code] !== undefined) {
      setPromoDiscount(PROMO_CODES[code]);
      setPromoError('');
    } else {
      setPromoDiscount(0);
      setPromoError('Code promo invalide');
    }
  };

  const onDeliverySubmit = (data: DeliveryFormData) => {
    setDeliveryData(data);
    setStep(2);
  };

  const onConfirmOrder = () => {
    clearCart();
    setStep(3);
  };

  /* ——— STEP 3 : Success ——— */
  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-xl border border-pink-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={40} className="text-green-500" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="font-playfair font-bold text-3xl text-gray-800 mb-4">
              Commande confirmée ! 🎉
            </h1>
            <p className="font-lato text-gray-600 leading-relaxed mb-2">
              Merci ! Ta commande est en cours de vérification.
            </p>
            <p className="font-cormorant text-lg text-gray-500 italic mb-8">
              Tu recevras une confirmation sur WhatsApp dans les 2h. 💕
            </p>

            <div className="bg-pink-50 rounded-2xl p-4 mb-8 text-left">
              <p className="font-lato text-sm text-gray-600">
                <span className="font-semibold text-gray-800">💬 Questions ?</span><br />
                Écris-nous sur WhatsApp au{' '}
                <a href="https://wa.me/50900000000" className="text-primary font-semibold">
                  509-XX-XX-XXXX
                </a>
              </p>
            </div>

            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 bg-primary hover:bg-pink-400 text-white font-lato font-semibold px-8 py-3.5 rounded-full transition-colors w-full justify-center"
            >
              Continuer mes achats →
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Stepper */}
        <CheckoutStepper currentStep={step} />

        <AnimatePresence mode="wait">
          {/* ===================== STEP 0 : CART ===================== */}
          {step === 0 && (
            <motion.div
              key="cart"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-playfair font-bold text-2xl sm:text-3xl text-gray-800 mb-8">
                🛍️ Mon Panier
              </h1>

              {items.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-6xl block mb-4" aria-hidden="true">💋</span>
                  <p className="font-playfair text-gray-500 text-xl mb-2">Ton panier est vide</p>
                  <p className="font-lato text-sm text-gray-400 mb-8">
                    Découvre nos glosses et ajoute tes teintes préférées
                  </p>
                  <Link
                    href="/boutique"
                    className="inline-flex items-center gap-2 bg-primary text-white font-lato font-semibold px-7 py-3 rounded-full hover:bg-pink-400 transition-colors"
                  >
                    <ShoppingBag size={16} />
                    Voir la boutique
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Cart items */}
                  <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-4 border border-pink-100 flex gap-4 items-center"
                      >
                        <div
                          className={`${item.bgColor} w-20 h-20 rounded-xl flex items-center justify-center text-3xl flex-shrink-0`}
                          aria-hidden="true"
                        >
                          💋
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-playfair font-semibold text-gray-800">{item.name}</p>
                          <p className="font-cormorant text-sm text-gray-400 italic">{item.shade}</p>
                          <p className="font-playfair font-bold text-primary mt-1">
                            {item.price_htg * item.quantity} HTG
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <button
                            onClick={() => removeItem(item.variantKey)}
                            className="text-gray-300 hover:text-red-400 transition-colors"
                            aria-label={`Supprimer ${item.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                          <div className="flex items-center gap-2 border border-pink-200 rounded-xl px-3 py-1.5">
                            <button
                              onClick={() => updateQuantity(item.variantKey, item.quantity - 1)}
                              className="text-gray-500 hover:text-primary transition-colors"
                              aria-label="Diminuer"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="font-lato text-sm font-semibold w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.variantKey, item.quantity + 1)}
                              className="text-gray-500 hover:text-primary transition-colors"
                              aria-label="Augmenter"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Promo code */}
                    <div className="bg-white rounded-2xl p-5 border border-pink-100">
                      <p className="font-playfair font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Tag size={16} className="text-primary" />
                        Code promo
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Ex: BESTIE10"
                          className="flex-1 font-lato text-sm border border-pink-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary bg-white"
                          onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                        />
                        <button
                          onClick={applyPromo}
                          className="bg-primary hover:bg-pink-400 text-white font-lato text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                        >
                          Appliquer
                        </button>
                      </div>
                      {promoError && (
                        <p className="font-lato text-xs text-red-500 mt-2">{promoError}</p>
                      )}
                      {promoDiscount > 0 && (
                        <p className="font-lato text-xs text-green-600 mt-2">
                          ✓ Code appliqué — {promoDiscount * 100}% de réduction !
                        </p>
                      )}
                      <p className="font-lato text-xs text-gray-400 mt-2">
                        Essaie BESTIE10 ou BESTIE15
                      </p>
                    </div>

                    {/* City selector for delivery fee */}
                    <div className="bg-white rounded-2xl p-5 border border-pink-100">
                      <p className="font-playfair font-semibold text-gray-800 mb-3">
                        📍 Estimer la livraison
                      </p>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full font-lato text-sm border border-pink-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary bg-white appearance-none cursor-pointer"
                        aria-label="Sélectionner une ville"
                      >
                        {Object.entries(CITY_FEES).map(([city, fee]) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-6 border border-pink-100 sticky top-24">
                      <h2 className="font-playfair font-semibold text-gray-800 text-lg mb-5">
                        Récapitulatif
                      </h2>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between font-lato text-gray-600">
                          <span>Sous-total</span>
                          <span>{subtotal} HTG</span>
                        </div>
                        {promoDiscount > 0 && (
                          <div className="flex justify-between font-lato text-green-600">
                            <span>Réduction ({promoDiscount * 100}%)</span>
                            <span>-{discountAmount} HTG</span>
                          </div>
                        )}
                        <div className="flex justify-between font-lato text-gray-600">
                          <span>Livraison ({selectedCity})</span>
                          <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                            {deliveryFee === 0 ? '🎉 Gratuite' : `${deliveryFee} HTG`}
                          </span>
                        </div>
                        {deliveryFee > 0 && discountedSubtotal < 2000 && (
                          <p className="font-lato text-xs text-gray-400">
                            Encore {2000 - discountedSubtotal} HTG pour la livraison gratuite
                          </p>
                        )}
                        <div className="border-t border-pink-100 pt-3 flex justify-between">
                          <span className="font-playfair font-bold text-gray-800">Total</span>
                          <span className="font-playfair font-bold text-primary text-xl">{total} HTG</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setStep(1)}
                        className="w-full bg-primary hover:bg-pink-400 text-white font-lato font-semibold py-3.5 rounded-xl transition-colors mt-6 min-h-[48px]"
                      >
                        Continuer → Livraison
                      </button>
                      <Link
                        href="/boutique"
                        className="block text-center font-lato text-xs text-gray-400 hover:text-primary transition-colors mt-3"
                      >
                        ← Continuer mes achats
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ===================== STEP 1 : DELIVERY ===================== */}
          {step === 1 && (
            <motion.div
              key="delivery"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-playfair font-bold text-2xl sm:text-3xl text-gray-800 mb-8">
                📦 Informations de livraison
              </h1>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <form
                  onSubmit={handleSubmit(onDeliverySubmit)}
                  className="lg:col-span-2 bg-white rounded-2xl p-6 border border-pink-100 space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="font-lato text-sm text-gray-700 font-medium block mb-1.5">
                        Prénom *
                      </label>
                      <input
                        {...register('prenom', { required: 'Prénom requis' })}
                        className="w-full font-lato text-sm border border-pink-200 rounded-xl px-4 py-3 outline-none focus:border-primary bg-white min-h-[44px]"
                        placeholder="Marie-Claire"
                      />
                      {errors.prenom && (
                        <p className="font-lato text-xs text-red-500 mt-1">{errors.prenom.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="font-lato text-sm text-gray-700 font-medium block mb-1.5">
                        Nom *
                      </label>
                      <input
                        {...register('nom', { required: 'Nom requis' })}
                        className="w-full font-lato text-sm border border-pink-200 rounded-xl px-4 py-3 outline-none focus:border-primary bg-white min-h-[44px]"
                        placeholder="Joseph"
                      />
                      {errors.nom && (
                        <p className="font-lato text-xs text-red-500 mt-1">{errors.nom.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="font-lato text-sm text-gray-700 font-medium block mb-1.5">
                      Adresse *
                    </label>
                    <input
                      {...register('adresse', { required: 'Adresse requise' })}
                      className="w-full font-lato text-sm border border-pink-200 rounded-xl px-4 py-3 outline-none focus:border-primary bg-white min-h-[44px]"
                      placeholder="Rue Martin Luther King, #12"
                    />
                    {errors.adresse && (
                      <p className="font-lato text-xs text-red-500 mt-1">{errors.adresse.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="font-lato text-sm text-gray-700 font-medium block mb-1.5">
                        Ville *
                      </label>
                      <select
                        {...register('ville', { required: 'Ville requise' })}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full font-lato text-sm border border-pink-200 rounded-xl px-4 py-3 outline-none focus:border-primary bg-white min-h-[44px] appearance-none cursor-pointer"
                      >
                        {Object.entries(CITY_FEES).map(([city]) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      {errors.ville && (
                        <p className="font-lato text-xs text-red-500 mt-1">{errors.ville.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="font-lato text-sm text-gray-700 font-medium block mb-1.5">
                        Quartier
                      </label>
                      <input
                        {...register('quartier')}
                        className="w-full font-lato text-sm border border-pink-200 rounded-xl px-4 py-3 outline-none focus:border-primary bg-white min-h-[44px]"
                        placeholder="Delmas 33, Lalue..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-lato text-sm text-gray-700 font-medium block mb-1.5">
                      Numéro WhatsApp *
                    </label>
                    <input
                      {...register('whatsapp', {
                        required: 'Numéro WhatsApp requis',
                        pattern: {
                          value: /^[0-9\s\-\+]{8,15}$/,
                          message: 'Numéro invalide',
                        },
                      })}
                      className="w-full font-lato text-sm border border-pink-200 rounded-xl px-4 py-3 outline-none focus:border-primary bg-white min-h-[44px]"
                      placeholder="509-XX-XX-XXXX"
                      type="tel"
                    />
                    {errors.whatsapp && (
                      <p className="font-lato text-xs text-red-500 mt-1">
                        {errors.whatsapp.message}
                      </p>
                    )}
                    <p className="font-lato text-xs text-gray-400 mt-1">
                      Ta commande sera confirmée sur ce numéro WhatsApp
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="border border-pink-200 text-gray-600 font-lato text-sm px-5 py-3 rounded-xl hover:border-primary hover:text-primary transition-colors min-h-[44px]"
                    >
                      ← Retour
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-pink-400 text-white font-lato font-semibold py-3 rounded-xl transition-colors min-h-[44px]"
                    >
                      Continuer → Paiement
                    </button>
                  </div>
                </form>

                {/* Mini summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl p-5 border border-pink-100">
                    <h3 className="font-playfair font-semibold text-gray-800 mb-4">Récapitulatif</h3>
                    <div className="space-y-2 text-sm font-lato text-gray-600">
                      <div className="flex justify-between">
                        <span>Sous-total</span>
                        <span>{discountedSubtotal} HTG</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Livraison</span>
                        <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                          {deliveryFee === 0 ? 'Gratuite 🎉' : `${deliveryFee} HTG`}
                        </span>
                      </div>
                      <div className="border-t border-pink-100 pt-2 flex justify-between font-bold">
                        <span className="font-playfair text-gray-800">Total</span>
                        <span className="font-playfair text-primary text-lg">{total} HTG</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-pink-100 space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between font-lato text-xs text-gray-500">
                          <span>
                            {item.name} ×{item.quantity}
                          </span>
                          <span>{item.price_htg * item.quantity} HTG</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================== STEP 2 : PAYMENT ===================== */}
          {step === 2 && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-playfair font-bold text-2xl sm:text-3xl text-gray-800 mb-8">
                💳 Paiement
              </h1>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Payment method cards */}
                  <div>
                    <p className="font-playfair font-semibold text-gray-800 mb-4">
                      Choisis ton mode de paiement
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* MonCash */}
                      <button
                        onClick={() => setPaymentMethod('moncash')}
                        className={`p-5 rounded-2xl border-2 text-left transition-all ${
                          paymentMethod === 'moncash'
                            ? 'border-primary bg-pink-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-pink-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white font-bold text-sm font-lato">
                            MC
                          </div>
                          <span className="font-playfair font-semibold text-gray-800">MonCash</span>
                          {paymentMethod === 'moncash' && (
                            <span className="ml-auto w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="font-lato text-xs text-gray-500">
                          Paiement via MonCash (Digicel)
                        </p>
                      </button>

                      {/* Zelle */}
                      <button
                        onClick={() => setPaymentMethod('zelle')}
                        className={`p-5 rounded-2xl border-2 text-left transition-all ${
                          paymentMethod === 'zelle'
                            ? 'border-primary bg-pink-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-pink-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm font-lato">
                            Z
                          </div>
                          <span className="font-playfair font-semibold text-gray-800">Zelle</span>
                          {paymentMethod === 'zelle' && (
                            <span className="ml-auto w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="font-lato text-xs text-gray-500">
                          Virement Zelle (États-Unis)
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Payment instructions */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={paymentMethod}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-2xl p-6 border border-pink-100"
                    >
                      {paymentMethod === 'moncash' ? (
                        <>
                          <h3 className="font-playfair font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold text-xs font-lato">MC</span>
                            Instructions MonCash
                          </h3>
                          <ol className="font-lato text-sm text-gray-600 space-y-3 list-none">
                            <li className="flex gap-3">
                              <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                              Ouvre l&apos;application MonCash sur ton téléphone
                            </li>
                            <li className="flex gap-3">
                              <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                              Choisis &ldquo;Payer un marchand&rdquo;
                            </li>
                            <li className="flex gap-3">
                              <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                              Envoie{' '}
                              <span className="font-bold text-primary">{total} HTG</span>{' '}
                              au numéro :
                            </li>
                          </ol>
                          <div className="mt-4 bg-red-50 rounded-xl p-4 text-center border border-red-100">
                            <p className="font-lato text-xs text-gray-500 mb-1">Numéro MonCash</p>
                            <p className="font-playfair font-bold text-xl text-red-600 tracking-wider">
                              509-XX-XX-XXXX
                            </p>
                            <p className="font-lato text-xs text-gray-500 mt-1">Bestie LipGloss</p>
                          </div>
                          <div className="mt-4 bg-primary/10 rounded-xl p-3 text-center">
                            <p className="font-lato text-sm text-gray-700">
                              Montant exact à envoyer :{' '}
                              <span className="font-bold text-primary text-lg">{total} HTG</span>
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="font-playfair font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold text-xs font-lato">Z</span>
                            Instructions Zelle
                          </h3>
                          <ol className="font-lato text-sm text-gray-600 space-y-3 list-none">
                            <li className="flex gap-3">
                              <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                              Ouvre ton application bancaire ou Zelle
                            </li>
                            <li className="flex gap-3">
                              <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                              Envoie le paiement à l&apos;adresse email :
                            </li>
                          </ol>
                          <div className="mt-4 bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                            <p className="font-lato text-xs text-gray-500 mb-1">Email Zelle</p>
                            <p className="font-playfair font-bold text-lg text-purple-700">
                              bestielipgloss@gmail.com
                            </p>
                            <p className="font-lato text-xs text-gray-500 mt-1">Bestie LipGloss</p>
                          </div>
                          <div className="mt-4 bg-primary/10 rounded-xl p-3 text-center">
                            <p className="font-lato text-sm text-gray-700">
                              Montant exact :{' '}
                              <span className="font-bold text-primary text-lg">
                                ${(total / 130).toFixed(2)} USD
                              </span>{' '}
                              <span className="text-gray-500 text-xs">({total} HTG)</span>
                            </p>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Screenshot upload */}
                  <div className="bg-white rounded-2xl p-6 border border-pink-100">
                    <p className="font-playfair font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Upload size={16} className="text-primary" />
                      Capture d&apos;écran de paiement
                    </p>
                    <p className="font-lato text-xs text-gray-500 mb-4">
                      Envoie une capture d&apos;écran confirmant ton paiement pour accélérer la
                      vérification de ta commande.
                    </p>
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPaymentFile(e.target.files?.[0] ?? null)}
                        className="hidden"
                        aria-label="Uploader la capture d'écran"
                      />
                      <div
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                          paymentFile
                            ? 'border-green-400 bg-green-50'
                            : 'border-pink-200 hover:border-primary bg-pink-50/30'
                        }`}
                      >
                        {paymentFile ? (
                          <div className="flex flex-col items-center gap-2">
                            <CheckCircle size={28} className="text-green-500" />
                            <p className="font-lato text-sm text-green-700 font-semibold">
                              {paymentFile.name}
                            </p>
                            <p className="font-lato text-xs text-gray-400">
                              Cliquer pour changer
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload size={28} className="text-primary/60" />
                            <p className="font-lato text-sm text-gray-600">
                              Cliquer pour uploader ta capture d&apos;écran
                            </p>
                            <p className="font-lato text-xs text-gray-400">JPG, PNG, GIF</p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="border border-pink-200 text-gray-600 font-lato text-sm px-5 py-3 rounded-xl hover:border-primary hover:text-primary transition-colors min-h-[44px]"
                    >
                      ← Retour
                    </button>
                    <button
                      onClick={onConfirmOrder}
                      className="flex-1 bg-primary hover:bg-pink-400 text-white font-lato font-semibold py-3.5 rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Confirmer ma commande
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl p-5 border border-pink-100 sticky top-24">
                    <h3 className="font-playfair font-semibold text-gray-800 mb-4">
                      Ta commande
                    </h3>
                    {deliveryData && (
                      <div className="bg-pink-50 rounded-xl p-3 mb-4 text-xs font-lato text-gray-600">
                        <p className="font-semibold text-gray-800 mb-1">Livraison pour :</p>
                        <p>
                          {deliveryData.prenom} {deliveryData.nom}
                        </p>
                        <p>{deliveryData.adresse}</p>
                        <p>
                          {deliveryData.quartier && `${deliveryData.quartier}, `}
                          {deliveryData.ville}
                        </p>
                        <p>📱 {deliveryData.whatsapp}</p>
                      </div>
                    )}
                    <div className="space-y-2 text-sm font-lato text-gray-600">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs">
                          <span className="truncate flex-1 mr-2">
                            {item.name} ×{item.quantity}
                          </span>
                          <span>{item.price_htg * item.quantity} HTG</span>
                        </div>
                      ))}
                      <div className="border-t border-pink-100 pt-2 space-y-1">
                        {promoDiscount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Réduction</span>
                            <span>-{discountAmount} HTG</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Livraison</span>
                          <span>{deliveryFee === 0 ? 'Gratuite' : `${deliveryFee} HTG`}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-1">
                          <span className="font-playfair text-gray-800">Total</span>
                          <span className="font-playfair text-primary text-lg">{total} HTG</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
