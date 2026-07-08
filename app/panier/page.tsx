'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, Tag, CreditCard, CheckCircle, MapPin, Phone, UserCircle, ChevronDown, MessageSquare, Lock, Zap, Clock } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore, type Address } from '@/store/authStore';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';
import CheckoutStepper from '@/components/CheckoutStepper';
import type { ZoneLivraison } from '@/app/api/zones-livraison/route';
import { useOrdersStore, type StoredOrder } from '@/store/ordersStore';
import { WHATSAPP_URL, WHATSAPP_NUMBER } from '@/lib/contact';

type DeliveryType = 'standard' | 'express';
type PromoInfo = { code: string; valeur: number; type: 'pct' | 'fixe' };
type SavedDelivery = { name: string; telephone: string; address: Address; instructions: string; deliveryType: DeliveryType };

const inputCls = 'w-full font-lato text-base border border-pink-200 rounded-xl px-4 py-3.5 outline-none focus:border-primary bg-white min-h-[48px]';
const labelCls = 'font-lato text-base text-gray-700 font-medium block mb-1.5';

function generateNumeroCommande(): string {
  const year = new Date().getFullYear();
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes)
    .map((b) => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 6)
    .toUpperCase();
  return `BES-${year}-${suffix}`;
}

function getZone(addr: Address, zones: ZoneLivraison[]): ZoneLivraison | undefined {
  if ((addr.country ?? 'hti') === 'usa') return zones.find((z) => z.pays === 'usa');
  return zones.find((z) => z.nom_zone === addr.ville);
}

function addrFee(addr: Address, discountedSubtotal: number, zones: ZoneLivraison[], type: DeliveryType = 'standard'): number {
  const zone = getZone(addr, zones);
  if (!zone) return 400;
  if (type === 'express') return zone.frais_express_htg ?? zone.frais_htg;
  const seuil = zone.seuil_gratuit ?? 2000;
  return discountedSubtotal >= seuil ? 0 : zone.frais_htg;
}

function addrFeeUSD(addr: Address, discountedSubtotalUSD: number, zones: ZoneLivraison[], type: DeliveryType = 'standard'): number {
  const zone = getZone(addr, zones);
  if (!zone) return parseFloat((400 / 130).toFixed(2));
  if (type === 'express') {
    if (zone.frais_express_usd != null) return zone.frais_express_usd;
    return parseFloat(((zone.frais_express_htg ?? zone.frais_htg) / 130).toFixed(2));
  }
  if (zone.frais_usd != null) {
    const seuil = zone.seuil_gratuit ?? 2000;
    return discountedSubtotalUSD * 130 >= seuil ? 0 : zone.frais_usd;
  }
  const seuil = zone.seuil_gratuit ?? 2000;
  if (discountedSubtotalUSD * 130 >= seuil) return 0;
  return parseFloat((zone.frais_htg / 130).toFixed(2));
}

function zoneDelay(zone: ZoneLivraison | undefined, type: DeliveryType = 'standard'): string | null {
  if (!zone) return null;
  if (type === 'express') {
    return zone.delai_express_heures != null ? `${zone.delai_express_heures}h` : null;
  }
  if (zone.delai_min_heures == null || zone.delai_max_heures == null) return null;
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
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();
  const { user } = useAuthStore();
  const { addOrder, orders } = useOrdersStore();
  const { lang } = useLanguageStore();
  const tc = translations[lang].checkout;
  const tCart = translations[lang].cart;

  const [step, setStep] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoInfo, setPromoInfo] = useState<PromoInfo | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const [zones, setZones] = useState<ZoneLivraison[]>([]);
  const [zonesLoaded, setZonesLoaded] = useState(false);
  const [zonesError, setZonesError] = useState(false);
  useEffect(() => {
    fetch('/api/zones-livraison')
      .then((r) => r.json())
      .then((d) => { setZones(d.zones ?? []); setZonesLoaded(true); })
      .catch(() => { setZonesError(true); });
  }, []);
  const retryZones = () => {
    setZonesError(false);
    fetch('/api/zones-livraison')
      .then((r) => r.json())
      .then((d) => { setZones(d.zones ?? []); setZonesLoaded(true); })
      .catch(() => { setZonesError(true); });
  };

  const savedAddresses = user?.addresses ?? [];
  const [selectedAddr, setSelectedAddr] = useState<Address | null>(null);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('standard');

  useEffect(() => {
    if (selectedAddr === null && savedAddresses.length > 0) {
      setSelectedAddr(savedAddresses[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAddresses.length]);

  // C3 — reset deliveryType to 'standard' when the selected zone has no express option
  useEffect(() => {
    if (!zonesLoaded || !selectedAddr) return;
    const zone = getZone(selectedAddr, zones);
    if (!zone?.frais_express_htg && deliveryType === 'express') setDeliveryType('standard');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddr?.id, zonesLoaded]);

  const [addrError, setAddrError] = useState('');

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

  const subtotal = totalPrice();
  const discountAmount = promoInfo
    ? promoInfo.type === 'pct'
      ? Math.round(subtotal * promoInfo.valeur)
      : Math.min(promoInfo.valeur, subtotal)
    : 0;
  const discountedSubtotal = subtotal - discountAmount;

  const deliveryFee = zonesLoaded && selectedAddr ? addrFee(selectedAddr, discountedSubtotal, zones, deliveryType) : 0;
  const total = discountedSubtotal + deliveryFee;

  // USD calculations
  const subtotalUSD = items.reduce((acc, i) => acc + i.price_usd * i.quantity, 0);
  const discountAmountUSD = promoInfo
    ? promoInfo.type === 'pct'
      ? subtotalUSD * promoInfo.valeur
      : promoInfo.valeur / 130
    : 0;
  const discountedSubtotalUSD = subtotalUSD - discountAmountUSD;
  const deliveryFeeUSD = zonesLoaded && selectedAddr ? addrFeeUSD(selectedAddr, discountedSubtotalUSD, zones, deliveryType) : 0;
  const totalUSD = discountedSubtotalUSD + deliveryFeeUSD;

  // Délai estimé selon la zone et le type de livraison
  const selectedZone = selectedAddr ? getZone(selectedAddr, zones) : undefined;
  const deliveryDelay = zoneDelay(selectedZone, deliveryType);
  const standardDelay = zoneDelay(selectedZone, 'standard');
  const expressDelay = zoneDelay(selectedZone, 'express');
  const standardFeeHTG = selectedAddr ? addrFee(selectedAddr, discountedSubtotal, zones, 'standard') : 0;
  const expressFeeHTG = selectedAddr ? addrFee(selectedAddr, discountedSubtotal, zones, 'express') : 0;
  const standardFeeUSD = selectedAddr ? addrFeeUSD(selectedAddr, discountedSubtotalUSD, zones, 'standard') : 0;
  const expressFeeUSD = selectedAddr ? addrFeeUSD(selectedAddr, discountedSubtotalUSD, zones, 'express') : 0;
  const hasExpress = selectedZone?.frais_express_htg != null;

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
    if (!zonesLoaded) return;
    if (!selectedAddr) { setAddrError(tc.selectAddressError); return; }
    setAddrError('');
    setDeliveryData({
      name: user?.name ?? '',
      telephone: user?.telephone ?? '',
      address: selectedAddr,
      instructions: instructionsLivraison,
      deliveryType,
    });
    if (!numeroCommande) setNumeroCommande(generateNumeroCommande());
    setPaymentError('');
    setStep(2);
  };

  // MonCash : redirige vers l'interface de paiement MonCash (API officielle)
  // La commande est sauvegardée en sessionStorage et finalisée sur /panier/retour-moncash
  // APRÈS vérification du paiement — le panier reste intact jusqu'à confirmation.
  const handleMoncashRedirect = async () => {
    if (!numeroCommande) return;
    setPaymentLoading(true);
    setPaymentError('');
    try {
      const res = await fetch('/api/paiement/moncash/initier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_commande: numeroCommande, montant_htg: total }),
      });
      const data = await res.json() as { success?: boolean; redirect_url?: string; error?: string; amount_token?: string };
      if (!res.ok || !data.redirect_url) {
        setPaymentError(data.error ?? tc.errorOccurred);
        return;
      }
      const pendingOrder: StoredOrder = {
        id: numeroCommande,
        date: new Date().toISOString(),
        status: 'attente',
        customerName: user?.name || [user?.prenom, user?.nom].filter(Boolean).join(' ') || '',
        customerEmail: user?.email ?? '',
        customerPhone: user?.telephone ?? '',
        items: items.map((i) => ({
          name: i.name, shade: i.shade, quantity: i.quantity,
          price_htg: i.price_htg, price_usd: i.price_usd, image: i.image, bgColor: i.bgColor,
        })),
        subtotalUSD: parseFloat(subtotalUSD.toFixed(2)),
        discountAmountUSD: promoInfo ? parseFloat(discountAmountUSD.toFixed(2)) : undefined,
        promoCode: promoInfo?.code || undefined,
        deliveryFeeUSD: parseFloat(deliveryFeeUSD.toFixed(2)),
        deliveryType: deliveryData?.deliveryType,
        total,
        totalUSD: parseFloat(totalUSD.toFixed(2)),
        deliveryAddress: deliveryData ? formatAddress(deliveryData.address) : '',
        instructionsLivraison: deliveryData?.instructions || undefined,
        paymentMethod: 'moncash',
        devise: 'HTG',
      };
      sessionStorage.setItem('moncash_pending_order', JSON.stringify(pendingOrder));
      if (data.amount_token) sessionStorage.setItem('moncash_amount_token', data.amount_token);
      window.location.href = data.redirect_url;
    } catch {
      setPaymentError(tc.errorConnection);
    } finally {
      setPaymentLoading(false);
    }
  };

  const onConfirmOrder = async () => {
    // MonCash → redirection API (pas de validation locale)
    if (paymentMethod === 'moncash') {
      await handleMoncashRedirect();
      return;
    }

    // Validation paiement pour Zelle / Carte
    if (paymentMethod === 'zelle') {
      if (!referenceTransaction.trim()) {
        setPaymentError(tc.errorPaymentRequired);
        return;
      }
    } else if (paymentMethod === 'card') {
      if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        setPaymentError(tc.errorCardRequired);
        return;
      }
    }

    setPaymentLoading(true);
    setPaymentError('');
    const devise: 'HTG' | 'USD' = 'USD'; // MonCash handled separately with redirect

    // Snapshot du panier avant clearCart
    const orderItems = items.map((i) => ({
      name: i.name,
      shade: i.shade,
      quantity: i.quantity,
      price_htg: i.price_htg,
      price_usd: i.price_usd,
      image: i.image,
      bgColor: i.bgColor,
    }));

    try {
      const res = await fetch('/api/paiement/soumettre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_commande: numeroCommande,
          mode_paiement: paymentMethod,
          montant_paye: parseFloat(totalUSD.toFixed(2)),
          devise_paiement: devise,
          reference_transaction: referenceTransaction || null,
          note_client: noteClient || null,
          instructions_livraison: deliveryData?.instructions || null,
          code_promo: promoInfo?.code || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPaymentError(data.message ?? tc.errorOccurred);
        return;
      }
      addOrder({
        id: numeroCommande,
        date: new Date().toISOString(),
        status: 'attente',
        customerName: user?.name || [user?.prenom, user?.nom].filter(Boolean).join(' ') || '',
        customerEmail: user?.email ?? '',
        customerPhone: user?.telephone ?? '',
        referenceTransaction: paymentMethod === 'zelle'
          ? (referenceTransaction.trim() || undefined)
          : paymentMethod === 'card'
            ? (cardNumber ? `**** ${cardNumber.replace(/\s/g, '').slice(-4)}` : undefined)
            : undefined,
        payerInfo: paymentMethod === 'card' ? (cardName.trim() || undefined) : undefined,
        items: orderItems,
        subtotalUSD: parseFloat(subtotalUSD.toFixed(2)),
        discountAmountUSD: promoInfo ? parseFloat(discountAmountUSD.toFixed(2)) : undefined,
        promoCode: promoInfo?.code || undefined,
        deliveryFeeUSD: parseFloat(deliveryFeeUSD.toFixed(2)),
        deliveryType: deliveryData?.deliveryType,
        total,
        totalUSD: parseFloat(totalUSD.toFixed(2)),
        deliveryAddress: deliveryData ? formatAddress(deliveryData.address) : '',
        instructionsLivraison: deliveryData?.instructions || undefined,
        paymentMethod,
        devise,
      });
      clearCart();
      setStep(3);
    } catch {
      setPaymentError(tc.errorConnection);
    } finally {
      setPaymentLoading(false);
    }
  };

  /* ——— STEP 3 : Reçu ——— */
  if (step === 3) {
    const confirmedOrder = orders.find((o) => o.id === numeroCommande);
    return (
      <div className="min-h-screen bg-[#F2E9E1] px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto space-y-4">

          {/* Header succès */}
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-pink-100">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={34} className="text-green-500" />
            </motion.div>
            <h1 className="font-playfair font-bold text-2xl text-gray-800 mb-1">{tc.confirmed}</h1>
            <p className="font-lato text-sm text-gray-500 mb-3">{tc.confirmedSub}</p>
            <div className="bg-gray-50 rounded-xl px-4 py-2.5 inline-block border border-gray-100">
              <p className="font-lato text-[10px] text-gray-400 mb-0.5">{tc.orderNumber}</p>
              <p className="font-playfair font-bold text-gray-800 tracking-wider text-sm">{numeroCommande}</p>
            </div>
            {deliveryData?.address && deliveryDelay && (
              <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 inline-block">
                <p className="font-lato text-xs text-amber-600 font-semibold">📦 {tc.estimatedDelivery} {deliveryDelay}</p>
                <p className="font-lato text-xs text-amber-500">{deliveryData.address.ville}</p>
              </div>
            )}
          </div>

          {/* Reçu détaillé */}
          {confirmedOrder && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100">
              <p className="font-playfair font-bold text-gray-800 mb-4">🧾 Détail de votre commande</p>

              {/* Articles */}
              <div className="space-y-2 mb-4">
                {confirmedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-5 h-5 rounded-full flex-shrink-0 ${item.bgColor}`} />
                      <span className="font-lato text-sm text-gray-700 truncate">
                        {item.name} <span className="text-gray-400">· {item.shade}</span>
                      </span>
                      <span className="font-lato text-xs text-gray-400 flex-shrink-0">×{item.quantity}</span>
                    </div>
                    <span className="font-lato text-sm font-semibold text-gray-800 flex-shrink-0">
                      ${(item.price_usd * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calcul */}
              <div className="border-t border-pink-50 pt-3 space-y-2">
                <div className="flex justify-between font-lato text-sm text-gray-500">
                  <span>Sous-total</span>
                  <span>${confirmedOrder.subtotalUSD.toFixed(2)}</span>
                </div>

                {confirmedOrder.promoCode && confirmedOrder.discountAmountUSD && (
                  <div className="flex justify-between font-lato text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      🏷️ Coupon <strong>{confirmedOrder.promoCode}</strong>
                    </span>
                    <span>−${confirmedOrder.discountAmountUSD.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-lato text-sm text-gray-500">
                  <span>Livraison {confirmedOrder.deliveryType === 'express' ? '(Express)' : '(Standard)'}</span>
                  <span>{confirmedOrder.deliveryFeeUSD === 0 ? '🎉 Gratuite' : `$${confirmedOrder.deliveryFeeUSD.toFixed(2)}`}</span>
                </div>

                <div className="border-t border-pink-100 pt-2 flex justify-between">
                  <span className="font-playfair font-bold text-gray-800">Total</span>
                  <span className="font-playfair font-bold text-primary text-xl">
                    {confirmedOrder.devise === 'HTG'
                      ? `${confirmedOrder.total.toLocaleString()} HTG`
                      : `$${confirmedOrder.totalUSD.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Adresse & paiement */}
              {confirmedOrder.deliveryAddress && (
                <div className="mt-4 pt-3 border-t border-pink-50 font-lato text-xs text-gray-500 space-y-1">
                  <p>📍 {confirmedOrder.deliveryAddress}</p>
                  <p>💳 {confirmedOrder.paymentMethod === 'moncash' ? 'MonCash' : confirmedOrder.paymentMethod === 'zelle' ? 'Zelle' : 'Carte'}</p>
                </div>
              )}
            </div>
          )}

          {/* Contact WhatsApp */}
          <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100">
            <p className="font-lato text-sm text-gray-600">
              <span className="font-semibold text-gray-800">{tc.questions}</span><br />
              {tc.questionsMsg}{' '}
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold">{WHATSAPP_NUMBER}</a>
            </p>
          </div>

          <Link href="/boutique" className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-pink-400 text-white font-lato font-semibold px-8 py-3.5 rounded-full transition-colors w-full">
            {tc.continueShopping}
          </Link>
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
              <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-gray-800 mb-8">{tc.cartTitle}</h1>

              {items.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-6xl block mb-4" aria-hidden="true">💋</span>
                  <p className="font-playfair text-gray-500 text-2xl mb-2">{tCart.empty}</p>
                  <p className="font-lato text-base text-gray-400 mb-8">{tc.emptyCartDesc}</p>
                  <Link href="/boutique" className="inline-flex items-center gap-2 bg-primary text-white font-lato font-semibold px-7 py-3 rounded-full hover:bg-pink-400 transition-colors text-base">
                    <ShoppingBag size={18} />{tCart.viewShop}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">

                    {/* Cart items */}
                    {items.map((item) => (
                      <div key={item.variantKey} className="bg-white rounded-2xl p-4 border-2 border-pink-100 transition-colors">
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
                            <p className="font-cormorant text-sm text-gray-400 italic">{item.shade}</p>
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
                      </div>
                    ))}

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
                                className="w-full font-lato text-base border border-pink-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary bg-white appearance-none cursor-pointer pr-9"
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
                              className="bg-primary hover:bg-pink-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-lato text-base font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                            >
                              {promoLoading ? tc.checking : tc.apply}
                            </button>
                          </div>
                          {(user.coupons ?? []).length === 0 && (
                            <p className="font-lato text-sm text-gray-400 mt-2">
                              {tc.noCoupons}{' '}
                              <Link href="/mon-compte" className="text-primary hover:underline">{tc.addCoupon}</Link>
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="bg-pink-50 rounded-xl p-3 text-center border border-pink-100">
                          <p className="font-lato text-sm text-gray-500">
                            <Link href="/connexion" className="text-primary font-semibold hover:underline">{tc.signInCoupons}</Link>{' '}
                            {tc.signInCouponsSuffix}
                          </p>
                        </div>
                      )}
                      {promoError && <p className="font-lato text-sm text-red-500 mt-2">{promoError}</p>}
                      {promoInfo && (
                        <p className="font-lato text-sm text-green-600 mt-2">
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
                            className="w-full font-lato text-base border border-pink-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary bg-white appearance-none cursor-pointer"
                            aria-label="Select an address to estimate delivery"
                          >
                            <option value="" disabled>{tc.chooseAddress}</option>
                            {savedAddresses.map((addr) => (
                              <option key={addr.id} value={addr.id}>
                                {(addr.country ?? 'hti') === 'usa' ? '🇺🇸' : '🇭🇹'} {addr.label} — {addr.adresse}, {addr.ville}
                              </option>
                            ))}
                          </select>
                          {zonesError ? (
                            <div className="flex items-center justify-between gap-2 bg-amber-50 rounded-xl px-3 py-2 border border-amber-100 mt-2">
                              <p className="font-lato text-sm text-amber-700">Impossible de charger les frais de livraison.</p>
                              <button onClick={retryZones} className="font-lato text-xs font-semibold text-primary hover:underline whitespace-nowrap">Réessayer</button>
                            </div>
                          ) : selectedAddr && (
                            <p className="font-lato text-sm text-primary font-semibold mt-2">
                              {tc.estimatedFee}{' '}
                              {!zonesLoaded ? '—' : addrFee(selectedAddr, discountedSubtotal, zones) === 0 ? tc.freeDelivery : `$${(addrFee(selectedAddr, discountedSubtotal, zones) / 130).toFixed(2)}`}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-6 border border-pink-100 sticky top-24">
                      <h2 className="font-playfair font-semibold text-gray-800 text-xl mb-5">{tc.summary}</h2>
                      <div className="space-y-3 text-base">
                        <div className="flex justify-between font-lato text-gray-600"><span>{tc.subtotal}</span><span>${subtotalUSD.toFixed(2)}</span></div>
                        {promoInfo && (
                          <div className="flex justify-between font-lato text-green-600">
                            <span>{tc.discount} ({promoInfo.type === 'pct' ? `${promoInfo.valeur * 100}%` : `$${(promoInfo.valeur / 130).toFixed(2)}`})</span>
                            <span>-${discountAmountUSD.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-lato text-gray-600">
                          <span>{tc.deliveryEstimate}</span>
                          <span className={deliveryFee === 0 && selectedAddr && zonesLoaded ? 'text-green-600 font-semibold' : ''}>
                            {!selectedAddr || !zonesLoaded ? '—' : deliveryFee === 0 ? tc.free : `$${deliveryFeeUSD.toFixed(2)}`}
                          </span>
                        </div>
                        {selectedAddr && deliveryFee > 0 && discountedSubtotal < 2000 && (addr => (addr.country ?? 'hti') === 'hti')(selectedAddr) && (
                          <p className="font-lato text-xs text-gray-400">{tc.awayFreeDelivery.replace('{n}', ((2000 - discountedSubtotal) / 130).toFixed(2))}</p>
                        )}
                        <div className="border-t border-pink-100 pt-3 flex justify-between">
                          <span className="font-playfair font-bold text-gray-800">{tc.estimatedTotal}</span>
                          <span className="font-playfair font-bold text-primary text-2xl">${totalUSD.toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setStep(1)}
                        className="w-full bg-primary hover:bg-pink-400 text-white font-lato font-semibold py-3.5 rounded-xl transition-colors mt-3 min-h-[48px]"
                      >
                        {tc.continueDelivery}
                      </button>
                      <Link href="/boutique" className="block text-center font-lato text-sm text-gray-400 hover:text-primary transition-colors mt-3">
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
              <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-gray-800 mb-8">{tc.deliveryTitle}</h1>

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
                            <p className="font-lato text-base font-semibold text-gray-800 truncate">{user.name}</p>
                            <p className="font-lato text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                              <Phone size={11} />{user.telephone ?? tc.noPhone}
                            </p>
                          </div>
                        </div>
                        <Link href="/mon-compte/informations" className="font-lato text-sm text-primary hover:underline whitespace-nowrap flex-shrink-0">
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
                              <p className="font-lato text-base font-semibold text-gray-800 flex items-center gap-2">
                                {addr.label}
                                {addr.est_principale && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-normal">{tc.primary}</span>
                                )}
                              </p>
                              <p className="font-lato text-sm text-gray-500 mt-0.5">{formatAddress(addr)}</p>
                              <p className="font-lato text-sm text-primary font-semibold mt-1.5">
                                {tc.deliveryFee}{' '}
                                {!zonesLoaded ? '—' : addrFee(addr, discountedSubtotal, zones) === 0 ? tc.freeShort : `$${(addrFee(addr, discountedSubtotal, zones) / 130).toFixed(2)}`}
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

                    {addrError && <p className="font-lato text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{addrError}</p>}
                  </div>

                  {/* Type de livraison Standard / Express */}
                  {selectedAddr && (
                    <div className="bg-white rounded-2xl p-6 border border-pink-100 space-y-3">
                      <h3 className="font-playfair font-semibold text-gray-800">Type de livraison</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Standard */}
                        <button type="button" onClick={() => setDeliveryType('standard')}
                          className={`text-left p-4 rounded-xl border-2 transition-all ${deliveryType === 'standard' ? 'border-primary bg-pink-50' : 'border-pink-100 hover:border-pink-200'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Clock size={15} className="text-primary" />
                            <span className="font-lato font-semibold text-gray-800 text-sm">Standard</span>
                            {deliveryType === 'standard' && <span className="ml-auto w-4 h-4 bg-primary rounded-full flex items-center justify-center text-white text-[10px]">✓</span>}
                          </div>
                          <p className="font-lato text-xs text-gray-500">{standardDelay ? `Délai estimé : ${standardDelay}` : 'Délai variable'}</p>
                          <p className="font-lato text-sm font-bold text-primary mt-1">
                            {standardFeeHTG === 0 ? '🎉 Gratuit' : `$${standardFeeUSD.toFixed(2)}`}
                          </p>
                        </button>
                        {/* Express */}
                        {hasExpress ? (
                          <button type="button" onClick={() => setDeliveryType('express')}
                            className={`text-left p-4 rounded-xl border-2 transition-all ${deliveryType === 'express' ? 'border-primary bg-pink-50' : 'border-pink-100 hover:border-pink-200'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <Zap size={15} className="text-amber-500" />
                              <span className="font-lato font-semibold text-gray-800 text-sm">Express</span>
                              {deliveryType === 'express' && <span className="ml-auto w-4 h-4 bg-primary rounded-full flex items-center justify-center text-white text-[10px]">✓</span>}
                            </div>
                            <p className="font-lato text-xs text-gray-500">{expressDelay ? `Délai estimé : ${expressDelay}` : 'Livraison rapide'}</p>
                            <p className="font-lato text-sm font-bold text-primary mt-1">${expressFeeUSD.toFixed(2)}</p>
                          </button>
                        ) : (
                          <div className="p-4 rounded-xl border-2 border-gray-100 opacity-50 bg-gray-50">
                            <div className="flex items-center gap-2 mb-1">
                              <Zap size={15} className="text-gray-400" />
                              <span className="font-lato font-semibold text-gray-400 text-sm">Express</span>
                            </div>
                            <p className="font-lato text-xs text-gray-400">Non disponible pour cette zone</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact & delivery instructions */}
                  <div className="bg-white rounded-2xl p-6 border border-pink-100 space-y-4">
                    <h3 className="font-playfair font-semibold text-gray-800 flex items-center gap-2">
                      <Phone size={16} className="text-primary" />{tc.contactTitle}
                    </h3>
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

                  {zonesError && (
                    <div className="flex items-center justify-between gap-3 bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
                      <p className="font-lato text-sm text-amber-700">Impossible de charger les zones de livraison — les frais ne peuvent pas être calculés.</p>
                      <button onClick={retryZones} className="font-lato text-sm font-semibold text-primary hover:underline whitespace-nowrap">Réessayer</button>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(0)}
                      className="border border-pink-200 text-gray-600 font-lato text-base px-5 py-3 rounded-xl hover:border-primary hover:text-primary transition-colors min-h-[48px]">
                      {tc.back}
                    </button>
                    <button type="button" onClick={handleDeliveryNext}
                      disabled={!zonesLoaded}
                      className="flex-1 bg-primary hover:bg-pink-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-lato font-semibold text-base py-3 rounded-xl transition-colors min-h-[48px]">
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
              <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-gray-800 mb-8">{tc.paymentTitle}</h1>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <p className="font-playfair font-semibold text-gray-800 mb-4">{tc.choosePayment}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button onClick={() => setPaymentMethod('moncash')}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'moncash' ? 'border-primary bg-pink-50 shadow-sm' : 'border-gray-200 bg-white hover:border-pink-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center text-white font-bold text-xs font-lato flex-shrink-0">MC</div>
                          <span className="font-playfair font-semibold text-gray-800 text-base">MonCash</span>
                          {paymentMethod === 'moncash' && <span className="ml-auto w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">✓</span>}
                        </div>
                        <p className="font-lato text-sm text-gray-500">{tc.moncashDesc}</p>
                      </button>
                      <button onClick={() => setPaymentMethod('zelle')}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'zelle' ? 'border-primary bg-pink-50 shadow-sm' : 'border-gray-200 bg-white hover:border-pink-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xs font-lato flex-shrink-0">Z</div>
                          <span className="font-playfair font-semibold text-gray-800 text-base">Zelle</span>
                          {paymentMethod === 'zelle' && <span className="ml-auto w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">✓</span>}
                        </div>
                        <p className="font-lato text-sm text-gray-500">{tc.zelleDesc}</p>
                      </button>
                      <button onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'card' ? 'border-primary bg-pink-50 shadow-sm' : 'border-gray-200 bg-white hover:border-pink-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CreditCard size={16} className="text-white" />
                          </div>
                          <span className="font-playfair font-semibold text-gray-800 text-base">Card</span>
                          {paymentMethod === 'card' && <span className="ml-auto w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">✓</span>}
                        </div>
                        <p className="font-lato text-sm text-gray-500">{tc.cardDesc}</p>
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div key={paymentMethod} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                      className="bg-white rounded-2xl p-6 border border-pink-100">
                      {paymentMethod === 'moncash' ? (
                        <>
                          <h3 className="font-playfair font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold text-xs font-lato">MC</span>
                            Paiement MonCash
                          </h3>
                          <div className="bg-red-50 rounded-xl p-5 text-center border border-red-100 space-y-3">
                            <p className="font-lato text-base text-gray-700">
                              Vous allez être redirigé vers l'interface de paiement sécurisée <strong>MonCash</strong> pour effectuer votre paiement de :
                            </p>
                            <p className="font-playfair font-bold text-3xl text-red-600">{total.toLocaleString()} HTG</p>
                            <p className="font-lato text-xs text-gray-400">
                              Commande n° {numeroCommande} · Votre paiement sera traité directement par MonCash / Digicel Haiti.
                            </p>
                          </div>
                          <p className="font-lato text-xs text-gray-400 mt-3 text-center">
                            En cliquant &ldquo;Confirmer la commande&rdquo;, vous serez redirigé vers MonCash pour finaliser le paiement.
                          </p>
                        </>
                      ) : paymentMethod === 'zelle' ? (
                        <>
                          <h3 className="font-playfair font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold text-xs font-lato">Z</span>{tc.zelleTitle}
                          </h3>
                          <ol className="font-lato text-base text-gray-600 space-y-3 list-none">
                            <li className="flex gap-3"><span className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>{tc.zelleStep1}</li>
                            <li className="flex gap-3"><span className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>{tc.zelleStep2}</li>
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

                  {/* Référence de transaction — uniquement pour Zelle */}
                  {paymentMethod === 'zelle' && (
                    <div className="bg-white rounded-2xl p-6 border border-pink-100">
                      <label className={labelCls} htmlFor="reference-transaction">
                        {tc.refLabel}
                      </label>
                      <input
                        id="reference-transaction"
                        type="text"
                        placeholder={tc.refZelle}
                        value={referenceTransaction}
                        onChange={(e) => setReferenceTransaction(e.target.value)}
                        className={inputCls}
                      />
                      <p className="font-lato text-xs text-gray-400 mt-1">{tc.refHint}</p>
                    </div>
                  )}

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
                    <button onClick={() => setStep(1)} disabled={paymentLoading} className="border border-pink-200 text-gray-600 font-lato text-base px-5 py-3 rounded-xl hover:border-primary hover:text-primary transition-colors min-h-[48px] disabled:opacity-50">{tc.back}</button>
                    <button
                      onClick={onConfirmOrder}
                      disabled={paymentLoading}
                      className="flex-1 bg-primary hover:bg-pink-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-lato font-semibold text-base py-3.5 rounded-xl transition-colors min-h-[52px] flex items-center justify-center gap-2"
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
                    <h3 className="font-playfair font-semibold text-gray-800 text-lg mb-4">{tc.yourOrder}</h3>
                    {deliveryData && (
                      <div className="bg-pink-50 rounded-xl p-3 mb-4 text-sm font-lato text-gray-600 space-y-0.5">
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
