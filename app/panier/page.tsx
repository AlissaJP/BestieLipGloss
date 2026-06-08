'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, Tag, CreditCard, CheckCircle, MapPin, Phone, UserCircle, ChevronDown, MessageSquare, Lock } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore, type Address } from '@/store/authStore';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';
import CheckoutStepper from '@/components/CheckoutStepper';
import { products } from '@/data/products';
import type { ColorVariant } from '@/data/products';
import type { ZoneLivraison } from '@/app/api/zones-livraison/route';

const USA_FEE = 3500;

type PromoInfo = { code: string; valeur: number; type: 'pct' | 'fixe' };

type SavedDelivery = { name: string; telephone: string; address: Address };

const inputCls = 'w-full font-lato text-sm border border-pink-200 rounded-xl px-4 py-3 outline-none focus:border-primary bg-white min-h-[44px]';
const labelCls = 'font-lato text-sm text-gray-700 font-medium block mb-1.5';

function generateNumeroCommande(): string {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BES-${year}-${suffix}`;
}

function addrFee(addr: Address, discountedSubtotal: number, zones: ZoneLivraison[]): number {
  if ((addr.country ?? 'hti') === 'usa') return USA_FEE;
  const zone = zones.find((z) => z.nom_zone === addr.ville);
  const frais = zone?.frais_htg ?? 400;
  const seuil = zone?.seuil_gratuit ?? 2000;
  return discountedSubtotal >= seuil ? 0 : frais;
}

// V5 — utilise frais_usd si défini pour la zone, sinon convertit le tarif HTG
function addrFeeUSD(addr: Address, discountedSubtotalUSD: number, zones: ZoneLivraison[]): number {
  if ((addr.country ?? 'hti') === 'usa') return parseFloat((USA_FEE / 130).toFixed(2));
  const zone = zones.find((z) => z.nom_zone === addr.ville);
  if (zone?.frais_usd != null) return zone.frais_usd;
  const fraisHTG = zone?.frais_htg ?? 400;
  const seuilHTG = zone?.seuil_gratuit ?? 2000;
  if (discountedSubtotalUSD * 130 >= seuilHTG) return 0;
  return parseFloat((fraisHTG / 130).toFixed(2));
}

// V6 — délai affiché pour une zone donnée ("24h" ou "24–48h")
function zoneDelay(zone: ZoneLivraison | undefined): string | null {
  if (!zone || zone.delai_min_heures == null || zone.delai_max_heures == null) return null;
  if (zone.delai_min_heures === zone.delai_max_heures) return `${zone.delai_min_heures}h`;
  return `${zone.delai_min_heures}–${zone.delai_max_heures}h`;
}

function formatAddress(addr: Address): string {
  if ((addr.country ?? 'hti') === 'usa') {
    return `${addr.adresse}, ${addr.ville}${addr.state ? `, ${addr.state}` : ''} ${addr.zipCode ?? ''}, USA`;
  }
  return `${addr.adresse}${addr.quartier ? `, ${addr.quartier}` : ''}, ${addr.ville}, Haiti`;
}

export default function PanierPage() {
  const { items, removeItem, updateQuantity, updateItemVariant, clearCart, totalPrice } = useCartStore();
  const { user } = useAuthStore();
  const { lang } = useLanguageStore();
  const tc = translations[lang].checkout;
  const tCart = translations[lang].cart;

  const [step, setStep] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoInfo, setPromoInfo] = useState<PromoInfo | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const [zones, setZones] = useState<ZoneLivraison[]>([]);
  useEffect(() => {
    fetch('/api/zones-livraison')
      .then((r) => r.json())
      .then((d) => setZones(d.zones ?? []))
      .catch(() => {});
  }, []);

  const savedAddresses = user?.addresses ?? [];
  const [selectedAddr, setSelectedAddr] = useState<Address | null>(savedAddresses[0] ?? null);
  const [addrError, setAddrError] = useState('');

  const [telephoneLivraison, setTelephoneLivraison] = useState('');
  const [instructionsLivraison, setInstructionsLivraison] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'moncash' | 'zelle' | 'card'>('moncash');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [referenceTransaction, setReferenceTransaction] = useState('');
  const [noteClient, setNoteClient] = useState('');
  const [deliveryData, setDeliveryData] = useState<SavedDelivery | null>(null);
  const [numeroCommande, setNumeroCommande] = useState('');

  const itemsNeedingVariant = items.filter((item) => {
    const p = products.find((pd) => pd.id === item.id);
    return p?.variants && item.variantKey === String(item.id);
  });
  const hasUnselectedVariants = itemsNeedingVariant.length > 0;

  const subtotal = totalPrice();
  const discountAmount = promoInfo
    ? promoInfo.type === 'pct'
      ? Math.round(subtotal * promoInfo.valeur)
      : Math.min(promoInfo.valeur, subtotal)
    : 0;
  const discountedSubtotal = subtotal - discountAmount;

  const deliveryFee = selectedAddr ? addrFee(selectedAddr, discountedSubtotal, zones) : 0;
  const total = discountedSubtotal + deliveryFee;

  // USD calculations
  const subtotalUSD = items.reduce((acc, i) => acc + i.price_usd * i.quantity, 0);
  const discountAmountUSD = promoInfo
    ? promoInfo.type === 'pct'
      ? subtotalUSD * promoInfo.valeur
      : promoInfo.valeur / 130
    : 0;
  const discountedSubtotalUSD = subtotalUSD - discountAmountUSD;
  const deliveryFeeUSD = selectedAddr ? addrFeeUSD(selectedAddr, discountedSubtotalUSD, zones) : 0; // V5
  const totalUSD = discountedSubtotalUSD + deliveryFeeUSD;

  // V6 — délai estimé pour la zone sélectionnée
  const selectedZone = selectedAddr ? zones.find((z) => z.nom_zone === selectedAddr.ville) : undefined;
  const deliveryDelay = zoneDelay(selectedZone);

  const applyPromo = async () => {
    if (!promoCode) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch(
        `/api/promo/valider?code=${encodeURIComponent(promoCode.trim())}&montant=${subtotal}`
      );
      const data = await res.json();
      if (data.valid) {
        setPromoInfo({ code: data.code, valeur: data.reduction_pct, type: data.type_reduction });
      } else {
        setPromoInfo(null);
        setPromoError(data.reason ?? tc.errorInvalidPromo);
      }
    } catch {
      setPromoInfo(null);
      setPromoError(tc.errorValidation);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleDeliveryNext = () => {
    if (!selectedAddr) { setAddrError(tc.selectAddressError); return; }
    setAddrError('');
    setDeliveryData({
      name: user?.name ?? '',
      telephone: telephoneLivraison || (user?.telephone ?? ''),
      address: selectedAddr,
    });
    if (!numeroCommande) setNumeroCommande(generateNumeroCommande());
    setPaymentError('');
    setStep(2);
  };

  const onConfirmOrder = async () => {
    setPaymentLoading(true);
    setPaymentError('');
    const devise: 'HTG' | 'USD' = paymentMethod === 'moncash' ? 'HTG' : 'USD';
    try {
      const res = await fetch('/api/paiement/soumettre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_commande: numeroCommande,
          mode_paiement: paymentMethod,
          montant_paye: paymentMethod === 'moncash' ? total : parseFloat(totalUSD.toFixed(2)),
          devise_paiement: devise,
          reference_transaction: referenceTransaction || null,
          note_client: noteClient || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPaymentError(data.message ?? tc.errorOccurred);
        return;
      }
      clearCart();
      setStep(3);
    } catch {
      setPaymentError(tc.errorConnection);
    } finally {
      setPaymentLoading(false);
    }
  };

  /* ——— STEP 3 : Success ——— */
  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#F2E9E1] flex items-center justify-center px-4 py-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-xl border border-pink-100">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h1 className="font-playfair font-bold text-3xl text-gray-800 mb-4">{tc.confirmed}</h1>
            <p className="font-lato text-gray-600 leading-relaxed mb-2">{tc.confirmedSub}</p>
            {numeroCommande && (
              <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 border border-gray-200 inline-block">
                <p className="font-lato text-xs text-gray-500 mb-0.5">{tc.orderNumber}</p>
                <p className="font-playfair font-bold text-gray-800 tracking-wider">{numeroCommande}</p>
              </div>
            )}
            <p className="font-cormorant text-lg text-gray-500 italic mb-4">{tc.whatsappConfirm}</p>
            {deliveryData?.address && deliveryDelay && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4 inline-block">
                <p className="font-lato text-xs text-amber-600 font-semibold">📦 {tc.estimatedDelivery} {deliveryDelay}</p>
                <p className="font-lato text-xs text-amber-500">{deliveryData.address.ville}</p>
              </div>
            )}
            <div className="bg-pink-50 rounded-2xl p-4 mb-8 text-left">
              <p className="font-lato text-sm text-gray-600">
                <span className="font-semibold text-gray-800">{tc.questions}</span><br />
                {tc.questionsMsg}{' '}
                <a href="https://wa.me/50900000000" className="text-primary font-semibold">509-XX-XX-XXXX</a>
              </p>
            </div>
            <Link href="/boutique" className="inline-flex items-center gap-2 bg-primary hover:bg-pink-400 text-white font-lato font-semibold px-8 py-3.5 rounded-full transition-colors w-full justify-center">
              {tc.continueShopping}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2E9E1]">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <CheckoutStepper currentStep={step} />

        <AnimatePresence mode="wait">

          {/* ===================== STEP 0 : CART ===================== */}
          {step === 0 && (
            <motion.div key="cart" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
              <h1 className="font-playfair font-bold text-2xl sm:text-3xl text-gray-800 mb-8">{tc.cartTitle}</h1>

              {items.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-6xl block mb-4" aria-hidden="true">💋</span>
                  <p className="font-playfair text-gray-500 text-xl mb-2">{tCart.empty}</p>
                  <p className="font-lato text-sm text-gray-400 mb-8">{tc.emptyCartDesc}</p>
                  <Link href="/boutique" className="inline-flex items-center gap-2 bg-primary text-white font-lato font-semibold px-7 py-3 rounded-full hover:bg-pink-400 transition-colors">
                    <ShoppingBag size={16} />{tCart.viewShop}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">

                    {/* Cart items */}
                    {items.map((item) => {
                      const productData = products.find((p) => p.id === item.id);
                      const needsVariant = !!(productData?.variants && item.variantKey === String(item.id));
                      return (
                        <div key={item.variantKey} className={`bg-white rounded-2xl p-4 border-2 transition-colors ${needsVariant ? 'border-amber-300' : 'border-pink-100'}`}>
                          <div className="flex gap-4 items-center">
                            {item.image ? (
                              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-pink-50">
                                <Image src={item.image} alt={item.shade} fill className="object-cover object-center" sizes="160px" quality={90} />
                              </div>
                            ) : (
                              <div className={`${item.bgColor} w-20 h-20 rounded-xl flex items-center justify-center text-3xl flex-shrink-0`} aria-hidden="true">💋</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-playfair font-semibold text-gray-800">{item.name}</p>
                              {needsVariant ? (
                                <p className="font-lato text-xs text-amber-600 font-medium mt-0.5">{tc.chooseShade}</p>
                              ) : (
                                <p className="font-cormorant text-sm text-gray-400 italic">{item.shade}</p>
                              )}
                              <p className="font-playfair font-bold text-primary mt-1">${(item.price_usd * item.quantity).toFixed(2)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <button onClick={() => removeItem(item.variantKey)} className="text-gray-300 hover:text-red-400 transition-colors" aria-label={`Remove ${item.name}`}>
                                <Trash2 size={15} />
                              </button>
                              <div className="flex items-center gap-2 border border-pink-200 rounded-xl px-3 py-1.5">
                                <button onClick={() => updateQuantity(item.variantKey, item.quantity - 1)} className="text-gray-500 hover:text-primary transition-colors" aria-label="Decrease"><Minus size={13} /></button>
                                <span className="font-lato text-sm font-semibold w-5 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.variantKey, item.quantity + 1)} className="text-gray-500 hover:text-primary transition-colors" aria-label="Increase"><Plus size={13} /></button>
                              </div>
                            </div>
                          </div>

                          {/* Inline variant picker */}
                          {needsVariant && productData?.variants && (
                            <div className="mt-3 pt-3 border-t border-amber-100">
                              <p className="font-lato text-xs text-gray-500 mb-2">{tc.selectShade}</p>
                              <div className="flex flex-wrap gap-2">
                                {productData.variants.map((v: ColorVariant) => (
                                  <button
                                    key={v.id}
                                    onClick={() => updateItemVariant(item.variantKey, {
                                      variantKey: `${item.id}::${v.id}`,
                                      shade: v.name,
                                      image: v.image,
                                      bgColor: v.bgColor,
                                    })}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-lato text-xs border-2 border-pink-200 hover:border-primary hover:text-primary text-gray-600 transition-all"
                                  >
                                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${v.bgColor}`} />
                                    {v.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Promo code */}
                    <div className="bg-white rounded-2xl p-5 border border-pink-100">
                      <p className="font-playfair font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Tag size={16} className="text-primary" />{tc.promoCode}
                      </p>
                      {user ? (
                        <>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <select
                                value={promoCode}
                                onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); setPromoInfo(null); }}
                                className="w-full font-lato text-sm border border-pink-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary bg-white appearance-none cursor-pointer pr-9"
                              >
                                <option value="">{tc.chooseCoupon}</option>
                                {(user.coupons ?? []).map((code) => (
                                  <option key={code} value={code}>{code}</option>
                                ))}
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                            <button
                              onClick={applyPromo}
                              disabled={!promoCode || promoLoading}
                              className="bg-primary hover:bg-pink-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-lato text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                            >
                              {promoLoading ? tc.checking : tc.apply}
                            </button>
                          </div>
                          {(user.coupons ?? []).length === 0 && (
                            <p className="font-lato text-xs text-gray-400 mt-2">
                              {tc.noCoupons}{' '}
                              <Link href="/mon-compte" className="text-primary hover:underline">{tc.addCoupon}</Link>
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="bg-pink-50 rounded-xl p-3 text-center border border-pink-100">
                          <p className="font-lato text-xs text-gray-500">
                            <Link href="/connexion" className="text-primary font-semibold hover:underline">{tc.signInCoupons}</Link>{' '}
                            {tc.signInCouponsSuffix}
                          </p>
                        </div>
                      )}
                      {promoError && <p className="font-lato text-xs text-red-500 mt-2">{promoError}</p>}
                      {promoInfo && (
                        <p className="font-lato text-xs text-green-600 mt-2">
                          {tc.promoApplied.replace('{code}', promoInfo.code)}{' '}
                          {promoInfo.type === 'pct'
                            ? tc.discountPct.replace('{n}', String(promoInfo.valeur * 100))
                            : tc.discountFixed.replace('{n}', (promoInfo.valeur / 130).toFixed(2))}!
                        </p>
                      )}
                    </div>

                    {/* Delivery estimator */}
                    <div className="bg-white rounded-2xl p-5 border border-pink-100">
                      <p className="font-playfair font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <MapPin size={16} className="text-primary" />{tc.estimateDelivery}
                      </p>
                      {savedAddresses.length === 0 ? (
                        <div className="bg-pink-50 rounded-xl p-4 text-center border border-pink-100">
                          <p className="font-lato text-sm text-gray-500 mb-2">{tc.noAddress}</p>
                          <Link href="/mon-compte/informations" className="font-lato text-sm text-primary font-semibold hover:underline">
                            {tc.addAddress}
                          </Link>
                        </div>
                      ) : (
                        <>
                          <select
                            value={selectedAddr?.id ?? ''}
                            onChange={(e) => {
                              const addr = savedAddresses.find((a) => a.id === e.target.value) ?? null;
                              setSelectedAddr(addr);
                            }}
                            className="w-full font-lato text-sm border border-pink-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary bg-white appearance-none cursor-pointer"
                            aria-label="Select an address to estimate delivery"
                          >
                            <option value="" disabled>{tc.chooseAddress}</option>
                            {savedAddresses.map((addr) => (
                              <option key={addr.id} value={addr.id}>
                                {(addr.country ?? 'hti') === 'usa' ? '🇺🇸' : '🇭🇹'} {addr.label} — {addr.adresse}, {addr.ville}
                              </option>
                            ))}
                          </select>
                          {selectedAddr && (
                            <p className="font-lato text-xs text-primary font-semibold mt-2">
                              {tc.estimatedFee} {addrFee(selectedAddr, discountedSubtotal, zones) === 0 ? tc.freeDelivery : `$${(addrFee(selectedAddr, discountedSubtotal, zones) / 130).toFixed(2)}`}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-6 border border-pink-100 sticky top-24">
                      <h2 className="font-playfair font-semibold text-gray-800 text-lg mb-5">{tc.summary}</h2>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between font-lato text-gray-600"><span>{tc.subtotal}</span><span>${subtotalUSD.toFixed(2)}</span></div>
                        {promoInfo && (
                          <div className="flex justify-between font-lato text-green-600">
                            <span>{tc.discount} ({promoInfo.type === 'pct' ? `${promoInfo.valeur * 100}%` : `$${(promoInfo.valeur / 130).toFixed(2)}`})</span>
                            <span>-${discountAmountUSD.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-lato text-gray-600">
                          <span>{tc.deliveryEstimate}</span>
                          <span className={deliveryFee === 0 && selectedAddr ? 'text-green-600 font-semibold' : ''}>
                            {!selectedAddr ? '—' : deliveryFee === 0 ? tc.free : `$${deliveryFeeUSD.toFixed(2)}`}
                          </span>
                        </div>
                        {selectedAddr && deliveryFee > 0 && discountedSubtotal < 2000 && (addr => (addr.country ?? 'hti') === 'hti')(selectedAddr) && (
                          <p className="font-lato text-xs text-gray-400">{tc.awayFreeDelivery.replace('{n}', ((2000 - discountedSubtotal) / 130).toFixed(2))}</p>
                        )}
                        <div className="border-t border-pink-100 pt-3 flex justify-between">
                          <span className="font-playfair font-bold text-gray-800">{tc.estimatedTotal}</span>
                          <span className="font-playfair font-bold text-primary text-xl">${totalUSD.toFixed(2)}</span>
                        </div>
                      </div>
                      {hasUnselectedVariants && (
                        <p className="font-lato text-xs text-amber-600 text-center mt-4">
                          {tc.shadeWarning}
                        </p>
                      )}
                      <button
                        onClick={() => !hasUnselectedVariants && setStep(1)}
                        disabled={hasUnselectedVariants}
                        className={`w-full font-lato font-semibold py-3.5 rounded-xl transition-colors mt-3 min-h-[48px] ${
                          hasUnselectedVariants
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-primary hover:bg-pink-400 text-white'
                        }`}
                      >
                        {tc.continueDelivery}
                      </button>
                      <Link href="/boutique" className="block text-center font-lato text-xs text-gray-400 hover:text-primary transition-colors mt-3">
                        {tc.backShopping}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ===================== STEP 1 : DELIVERY ===================== */}
          {step === 1 && (
            <motion.div key="delivery" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
              <h1 className="font-playfair font-bold text-2xl sm:text-3xl text-gray-800 mb-8">{tc.deliveryTitle}</h1>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-5">

                  {/* Recipient */}
                  <div className="bg-white rounded-2xl p-6 border border-pink-100 space-y-4">
                    <h3 className="font-playfair font-semibold text-gray-800">{tc.recipient}</h3>
                    {user ? (
                      <div className="bg-pink-50 rounded-xl p-4 border border-pink-100 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <UserCircle size={22} className="text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-lato text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                            <p className="font-lato text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Phone size={11} />{user.telephone ?? tc.noPhone}
                            </p>
                          </div>
                        </div>
                        <Link href="/mon-compte/informations" className="font-lato text-xs text-primary hover:underline whitespace-nowrap flex-shrink-0">
                          {tc.edit}
                        </Link>
                      </div>
                    ) : (
                      <div className="bg-pink-50 rounded-xl p-4 text-center border border-pink-100">
                        <p className="font-lato text-sm text-gray-600 mb-3">{tc.signInSaved}</p>
                        <Link href="/connexion" className="inline-flex items-center gap-1.5 bg-primary hover:bg-pink-400 text-white font-lato text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
                          {tc.signIn}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Address selector */}
                  <div className="bg-white rounded-2xl p-6 border border-pink-100 space-y-4">
                    <h3 className="font-playfair font-semibold text-gray-800 flex items-center gap-2">
                      <MapPin size={16} className="text-primary" />{tc.deliveryAddress}
                    </h3>

                    {savedAddresses.length === 0 ? (
                      <div className="bg-pink-50 rounded-xl p-5 text-center border border-pink-100">
                        <p className="font-lato text-sm text-gray-600 mb-3">{tc.noSavedAddress}</p>
                        <Link href="/mon-compte/informations" className="inline-flex items-center gap-1.5 bg-primary hover:bg-pink-400 text-white font-lato text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
                          <Plus size={14} />{tc.addAddressBtn}
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => { setSelectedAddr(addr); setAddrError(''); }}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                              selectedAddr?.id === addr.id
                                ? 'border-primary bg-pink-50'
                                : 'border-pink-100 bg-white hover:border-pink-200'
                            }`}
                          >
                            <span className="text-xl mt-0.5 flex-shrink-0">{(addr.country ?? 'hti') === 'usa' ? '🇺🇸' : '🇭🇹'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-lato text-sm font-semibold text-gray-800 flex items-center gap-2">
                                {addr.label}
                                {addr.est_principale && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-normal">{tc.primary}</span>
                                )}
                              </p>
                              <p className="font-lato text-xs text-gray-500 mt-0.5">{formatAddress(addr)}</p>
                              <p className="font-lato text-xs text-primary font-semibold mt-1.5">
                                {tc.deliveryFee} {addrFee(addr, discountedSubtotal, zones) === 0 ? tc.freeShort : `$${(addrFee(addr, discountedSubtotal, zones) / 130).toFixed(2)}`}
                              </p>
                            </div>
                            {selectedAddr?.id === addr.id && (
                              <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">✓</span>
                            )}
                          </button>
                        ))}

                        <Link href="/mon-compte/informations" className="inline-flex items-center gap-1.5 font-lato text-sm text-primary hover:underline">
                          <Plus size={14} />{tc.addNewAddress}
                        </Link>
                      </div>
                    )}

                    {addrError && <p className="font-lato text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{addrError}</p>}
                  </div>

                  {/* Contact & delivery instructions */}
                  <div className="bg-white rounded-2xl p-6 border border-pink-100 space-y-4">
                    <h3 className="font-playfair font-semibold text-gray-800 flex items-center gap-2">
                      <Phone size={16} className="text-primary" />{tc.contactTitle}
                    </h3>
                    <div>
                      <label className={labelCls} htmlFor="tel-livraison">
                        {tc.whatsappLabel}
                        <span className="text-gray-400 font-normal ml-1">{tc.optional}</span>
                      </label>
                      <input
                        id="tel-livraison"
                        type="tel"
                        placeholder={user?.telephone ?? '509-XX-XX-XXXX'}
                        value={telephoneLivraison}
                        onChange={(e) => setTelephoneLivraison(e.target.value)}
                        className={inputCls}
                      />
                      <p className="font-lato text-xs text-gray-400 mt-1">{tc.whatsappHint}</p>
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="instructions-livraison">
                        {tc.instructionsLabel}
                        <span className="text-gray-400 font-normal ml-1">{tc.optional}</span>
                      </label>
                      <textarea
                        id="instructions-livraison"
                        rows={3}
                        placeholder={tc.instructionsPlaceholder}
                        value={instructionsLivraison}
                        onChange={(e) => setInstructionsLivraison(e.target.value)}
                        className="w-full font-lato text-sm border border-pink-200 rounded-xl px-4 py-3 outline-none focus:border-primary bg-white resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(0)}
                      className="border border-pink-200 text-gray-600 font-lato text-sm px-5 py-3 rounded-xl hover:border-primary hover:text-primary transition-colors min-h-[44px]">
                      {tc.back}
                    </button>
                    <button type="button" onClick={handleDeliveryNext}
                      className="flex-1 bg-primary hover:bg-pink-400 text-white font-lato font-semibold py-3 rounded-xl transition-colors min-h-[44px]">
                      {tc.continuePayment}
                    </button>
                  </div>
                </div>

                {/* Mini summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl p-5 border border-pink-100 sticky top-24">
                    <h3 className="font-playfair font-semibold text-gray-800 mb-4">{tc.summary}</h3>
                    {selectedAddr && (
                      <div className="bg-pink-50 rounded-xl p-3 mb-4 flex items-start gap-2">
                        <span className="text-base">{(selectedAddr.country ?? 'hti') === 'usa' ? '🇺🇸' : '🇭🇹'}</span>
                        <div className="min-w-0">
                          <p className="font-lato text-xs font-semibold text-gray-800">{selectedAddr.label}</p>
                          <p className="font-lato text-xs text-gray-500 mt-0.5 leading-relaxed">{formatAddress(selectedAddr)}</p>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2 text-sm font-lato text-gray-600">
                      <div className="flex justify-between"><span>{tc.subtotal}</span><span>${discountedSubtotalUSD.toFixed(2)}</span></div>
                      <div className="flex justify-between">
                        <span>{tc.delivery}</span>
                        <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>{deliveryFee === 0 ? `${tc.freeShort} 🎉` : `$${deliveryFeeUSD.toFixed(2)}`}</span>
                      </div>
                      <div className="border-t border-pink-100 pt-2 flex justify-between font-bold">
                        <span className="font-playfair text-gray-800">{tc.total}</span>
                        <span className="font-playfair text-primary text-lg">${totalUSD.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-pink-100 space-y-2">
                      {items.map((item) => (
                        <div key={item.variantKey} className="flex justify-between font-lato text-xs text-gray-500">
                          <span>{item.name} ×{item.quantity}</span>
                          <span>${(item.price_usd * item.quantity).toFixed(2)}</span>
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
            <motion.div key="payment" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
              <h1 className="font-playfair font-bold text-2xl sm:text-3xl text-gray-800 mb-8">{tc.paymentTitle}</h1>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <p className="font-playfair font-semibold text-gray-800 mb-4">{tc.choosePayment}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button onClick={() => setPaymentMethod('moncash')}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'moncash' ? 'border-primary bg-pink-50 shadow-sm' : 'border-gray-200 bg-white hover:border-pink-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center text-white font-bold text-xs font-lato flex-shrink-0">MC</div>
                          <span className="font-playfair font-semibold text-gray-800 text-sm">MonCash</span>
                          {paymentMethod === 'moncash' && <span className="ml-auto w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">✓</span>}
                        </div>
                        <p className="font-lato text-xs text-gray-500">{tc.moncashDesc}</p>
                      </button>
                      <button onClick={() => setPaymentMethod('zelle')}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'zelle' ? 'border-primary bg-pink-50 shadow-sm' : 'border-gray-200 bg-white hover:border-pink-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xs font-lato flex-shrink-0">Z</div>
                          <span className="font-playfair font-semibold text-gray-800 text-sm">Zelle</span>
                          {paymentMethod === 'zelle' && <span className="ml-auto w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">✓</span>}
                        </div>
                        <p className="font-lato text-xs text-gray-500">{tc.zelleDesc}</p>
                      </button>
                      <button onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'card' ? 'border-primary bg-pink-50 shadow-sm' : 'border-gray-200 bg-white hover:border-pink-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CreditCard size={16} className="text-white" />
                          </div>
                          <span className="font-playfair font-semibold text-gray-800 text-sm">Card</span>
                          {paymentMethod === 'card' && <span className="ml-auto w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">✓</span>}
                        </div>
                        <p className="font-lato text-xs text-gray-500">{tc.cardDesc}</p>
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div key={paymentMethod} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                      className="bg-white rounded-2xl p-6 border border-pink-100">
                      {paymentMethod === 'moncash' ? (
                        <>
                          <h3 className="font-playfair font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold text-xs font-lato">MC</span>{tc.moncashTitle}
                          </h3>
                          <ol className="font-lato text-sm text-gray-600 space-y-3 list-none">
                            <li className="flex gap-3"><span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>{tc.moncashStep1}</li>
                            <li className="flex gap-3"><span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>{tc.moncashStep2prefix} &ldquo;{tc.moncashStep2}&rdquo;</li>
                            <li className="flex gap-3"><span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>{tc.moncashStep3prefix} <span className="font-bold text-primary mx-1">{total} {tc.moncashStep3suffix}</span></li>
                          </ol>
                          <div className="mt-4 bg-red-50 rounded-xl p-4 text-center border border-red-100">
                            <p className="font-lato text-xs text-gray-500 mb-1">{tc.moncashNumber}</p>
                            <p className="font-playfair font-bold text-xl text-red-600 tracking-wider">509-XX-XX-XXXX</p>
                            <p className="font-lato text-xs text-gray-500 mt-1">Bestie LipGloss</p>
                          </div>
                          <div className="mt-4 bg-primary/10 rounded-xl p-3 text-center">
                            <p className="font-lato text-sm text-gray-700">{tc.exactAmount} <span className="font-bold text-primary text-lg">{total} HTG</span></p>
                          </div>
                        </>
                      ) : paymentMethod === 'zelle' ? (
                        <>
                          <h3 className="font-playfair font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold text-xs font-lato">Z</span>{tc.zelleTitle}
                          </h3>
                          <ol className="font-lato text-sm text-gray-600 space-y-3 list-none">
                            <li className="flex gap-3"><span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>{tc.zelleStep1}</li>
                            <li className="flex gap-3"><span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>{tc.zelleStep2}</li>
                          </ol>
                          <div className="mt-4 bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                            <p className="font-lato text-xs text-gray-500 mb-1">{tc.zelleEmail}</p>
                            <p className="font-playfair font-bold text-lg text-purple-700">bestielipgloss@gmail.com</p>
                            <p className="font-lato text-xs text-gray-500 mt-1">Bestie LipGloss</p>
                          </div>
                          <div className="mt-4 bg-primary/10 rounded-xl p-3 text-center">
                            <p className="font-lato text-sm text-gray-700">{tc.exactAmount} <span className="font-bold text-primary text-lg">${totalUSD.toFixed(2)}</span></p>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="font-playfair font-semibold text-gray-800 mb-5 flex items-center gap-2">
                            <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <CreditCard size={15} className="text-gray-700" />
                            </span>{tc.cardTitle}
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className={labelCls} htmlFor="card-name">{tc.cardName}</label>
                              <input
                                id="card-name"
                                type="text"
                                placeholder={tc.cardNamePlaceholder}
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                className={inputCls}
                                autoComplete="cc-name"
                              />
                            </div>
                            <div>
                              <label className={labelCls} htmlFor="card-number">{tc.cardNumber}</label>
                              <input
                                id="card-number"
                                type="text"
                                inputMode="numeric"
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                value={cardNumber}
                                onChange={(e) => {
                                  const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                                  setCardNumber(digits.replace(/(.{4})/g, '$1 ').trim());
                                }}
                                className={inputCls + ' tracking-widest'}
                                autoComplete="cc-number"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className={labelCls} htmlFor="card-expiry">{tc.cardExpiry}</label>
                                <input
                                  id="card-expiry"
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="MM / YY"
                                  maxLength={7}
                                  value={cardExpiry}
                                  onChange={(e) => {
                                    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    setCardExpiry(digits.length > 2 ? digits.slice(0, 2) + ' / ' + digits.slice(2) : digits);
                                  }}
                                  className={inputCls}
                                  autoComplete="cc-exp"
                                />
                              </div>
                              <div>
                                <label className={labelCls} htmlFor="card-cvv">{tc.cardCvv}</label>
                                <input
                                  id="card-cvv"
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="123"
                                  maxLength={4}
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                  className={inputCls}
                                  autoComplete="cc-csc"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="mt-5 flex items-center justify-center gap-2 text-gray-400">
                            <Lock size={12} />
                            <p className="font-lato text-xs">{tc.cardSecured}</p>
                          </div>
                          <div className="mt-3 bg-primary/10 rounded-xl p-3 text-center">
                            <p className="font-lato text-sm text-gray-700">{tc.amountCharge} <span className="font-bold text-primary text-lg">${totalUSD.toFixed(2)}</span></p>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Transaction reference */}
                  <div className="bg-white rounded-2xl p-6 border border-pink-100">
                    <label className={labelCls} htmlFor="reference-transaction">
                      {tc.refLabel}
                      <span className="text-gray-400 font-normal ml-1">{tc.optional}</span>
                    </label>
                    <input
                      id="reference-transaction"
                      type="text"
                      placeholder={paymentMethod === 'moncash' ? tc.refMoncash : paymentMethod === 'zelle' ? tc.refZelle : tc.refCard}
                      value={referenceTransaction}
                      onChange={(e) => setReferenceTransaction(e.target.value)}
                      className={inputCls}
                    />
                    <p className="font-lato text-xs text-gray-400 mt-1">{tc.refHint}</p>
                  </div>

                  {/* Client note */}
                  <div className="bg-white rounded-2xl p-6 border border-pink-100">
                    <label className={labelCls} htmlFor="note-client">
                      <MessageSquare size={14} className="inline mr-1 text-primary" />
                      {tc.noteLabel}
                      <span className="text-gray-400 font-normal ml-1">{tc.optional}</span>
                    </label>
                    <textarea
                      id="note-client"
                      rows={3}
                      placeholder={tc.notePlaceholder}
                      value={noteClient}
                      onChange={(e) => setNoteClient(e.target.value)}
                      className="w-full font-lato text-sm border border-pink-200 rounded-xl px-4 py-3 outline-none focus:border-primary bg-white resize-none"
                    />
                  </div>

                  {paymentError && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠</span>
                      <p className="font-lato text-sm text-amber-800">{paymentError}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} disabled={paymentLoading} className="border border-pink-200 text-gray-600 font-lato text-sm px-5 py-3 rounded-xl hover:border-primary hover:text-primary transition-colors min-h-[44px] disabled:opacity-50">{tc.back}</button>
                    <button
                      onClick={onConfirmOrder}
                      disabled={paymentLoading}
                      className="flex-1 bg-primary hover:bg-pink-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-lato font-semibold py-3.5 rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2"
                    >
                      {paymentLoading ? (
                        <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{tc.submitting}</>
                      ) : (
                        <><CheckCircle size={18} />{tc.confirm}</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl p-5 border border-pink-100 sticky top-24">
                    <h3 className="font-playfair font-semibold text-gray-800 mb-4">{tc.yourOrder}</h3>
                    {deliveryData && (
                      <div className="bg-pink-50 rounded-xl p-3 mb-4 text-xs font-lato text-gray-600 space-y-0.5">
                        <p className="font-semibold text-gray-800">{tc.deliveringTo}</p>
                        <p>{deliveryData.name}</p>
                        <p>{formatAddress(deliveryData.address)}</p>
                        {deliveryData.telephone && <p>📱 {deliveryData.telephone}</p>}
                      </div>
                    )}
                    <div className="space-y-2 text-sm font-lato text-gray-600">
                      {items.map((item) => (
                        <div key={item.variantKey} className="flex justify-between text-xs">
                          <span className="truncate flex-1 mr-2">{item.name} ×{item.quantity}</span>
                          <span>${(item.price_usd * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t border-pink-100 pt-2 space-y-1">
                        {promoInfo && <div className="flex justify-between text-green-600"><span>{tc.discount}</span><span>-${discountAmountUSD.toFixed(2)}</span></div>}
                        <div className="flex justify-between"><span>{tc.delivery}</span><span>{deliveryFee === 0 ? tc.freeShort : `$${deliveryFeeUSD.toFixed(2)}`}</span></div>
                        <div className="flex justify-between font-bold pt-1">
                          <span className="font-playfair text-gray-800">{tc.total}</span>
                          <span className="font-playfair text-primary text-lg">${totalUSD.toFixed(2)}</span>
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
