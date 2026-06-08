'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, MapPin, CreditCard, XCircle } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { useOrdersStore, type StoredOrder, type OrderStatus } from '@/store/ordersStore';
import { translations } from '@/lib/translations';

const STATUS_STYLES: Record<OrderStatus, { emoji: string; pill: string; active: string; dot: string }> = {
  attente:   { emoji: '⏳', pill: 'bg-orange-100 text-orange-700',  active: 'bg-orange-500 text-white shadow-sm shadow-orange-200',  dot: 'bg-orange-400' },
  valide:    { emoji: '✅', pill: 'bg-blue-100 text-blue-700',      active: 'bg-blue-500 text-white shadow-sm shadow-blue-200',      dot: 'bg-blue-400' },
  livraison: { emoji: '🛵', pill: 'bg-purple-100 text-purple-700',  active: 'bg-purple-500 text-white shadow-sm shadow-purple-200',  dot: 'bg-purple-400' },
  livre:     { emoji: '💕', pill: 'bg-green-100 text-green-700',    active: 'bg-green-500 text-white shadow-sm shadow-green-200',    dot: 'bg-green-400' },
  annule:    { emoji: '🚫', pill: 'bg-gray-100 text-gray-500',      active: 'bg-gray-500 text-white shadow-sm shadow-gray-200',      dot: 'bg-gray-400' },
};

const STATUS_KEYS: OrderStatus[] = ['attente', 'valide', 'livraison', 'livre', 'annule'];

function formatDate(iso: string, lang: string): string {
  return new Date(iso).toLocaleDateString(
    lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric' }
  );
}

const PAY_LABEL: Record<string, string> = { moncash: 'MonCash', zelle: 'Zelle', card: 'Card' };

type TOrders = typeof translations['fr']['pages']['orders'];

function OrderCard({
  order, lang, t, cancellingId, setCancellingId, onCancel,
}: {
  order: StoredOrder;
  lang: string;
  t: TOrders;
  cancellingId: string | null;
  setCancellingId: (id: string | null) => void;
  onCancel: (id: string) => void;
}) {
  const style = STATUS_STYLES[order.status];
  const isCancelling = cancellingId === order.id;
  const tStatuses = t.statuses;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-pink-100 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-pink-50">
        <div>
          <p className="font-playfair font-bold text-gray-800 text-sm tracking-wide">{order.id}</p>
          <p className="font-lato text-xs text-gray-400 mt-0.5">
            {t.orderDate} {formatDate(order.date, lang)}
          </p>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-lato font-semibold px-3 py-1.5 rounded-full ${style.pill}`}>
          <span>{style.emoji}</span>
          {tStatuses[order.status].label}
        </span>
      </div>

      {/* Items */}
      <div className="px-5 py-4 space-y-2.5 border-b border-pink-50">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex-shrink-0 ${item.bgColor}`} />
            <p className="font-lato text-sm text-gray-700 flex-1 min-w-0 truncate">
              {item.name}
              <span className="text-gray-400 ml-1 font-normal">· {item.shade}</span>
            </p>
            <span className="font-lato text-xs text-gray-500 font-semibold flex-shrink-0">×{item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 font-lato text-xs text-gray-500">
            <CreditCard size={13} className="text-primary flex-shrink-0" />
            {t.payVia} <span className="font-semibold text-gray-700 ml-1">{PAY_LABEL[order.paymentMethod] ?? order.paymentMethod}</span>
          </div>
          <p className="font-playfair font-bold text-gray-800">
            {order.devise === 'HTG'
              ? `${order.total.toLocaleString()} HTG`
              : `$${order.totalUSD.toFixed(2)}`}
          </p>
        </div>

        {order.deliveryAddress && (
          <div className="flex items-start gap-1.5 font-lato text-xs text-gray-400">
            <MapPin size={12} className="text-primary flex-shrink-0 mt-0.5" />
            <span>{order.deliveryAddress}</span>
          </div>
        )}

        {/* Cancel — only for 'attente' orders */}
        {order.status === 'attente' && (
          <div className="pt-1">
            {!isCancelling ? (
              <button
                onClick={() => setCancellingId(order.id)}
                className="flex items-center gap-1.5 font-lato text-sm text-red-400 hover:text-red-600 transition-colors"
              >
                <XCircle size={15} />
                {t.cancelBtn}
              </button>
            ) : (
              <div className="flex items-center flex-wrap gap-3 bg-red-50 rounded-xl px-4 py-3">
                <p className="font-lato text-sm text-gray-600 flex-1">{t.cancelConfirm}</p>
                <button
                  onClick={() => onCancel(order.id)}
                  className="font-lato text-sm font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
                >
                  {t.cancelYes}
                </button>
                <button
                  onClick={() => setCancellingId(null)}
                  className="font-lato text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {t.cancelNo}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function CommandesPage() {
  const { lang } = useLanguageStore();
  const t = translations[lang].pages.orders;
  const { orders, cancelOrder } = useOrdersStore();

  const [activeTab, setActiveTab] = useState<OrderStatus>('attente');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => o.status === activeTab);

  const handleCancel = (id: string) => {
    cancelOrder(id);
    setCancellingId(null);
  };

  return (
    <div className="min-h-screen bg-[#F2E9E1]">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/mon-compte" className="inline-flex items-center gap-2 font-lato text-sm text-gray-500 hover:text-primary transition-colors mb-8">
          <ArrowLeft size={15} />{t.back}
        </Link>

        <h1 className="font-playfair font-bold text-3xl text-gray-800 mb-2">{t.heading}</h1>
        <p className="font-lato text-sm text-gray-500 mb-8">{t.sub}</p>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {STATUS_KEYS.map((key) => {
            const style = STATUS_STYLES[key];
            const count = orders.filter((o) => o.status === key).length;
            return (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setCancellingId(null); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-lato text-sm font-medium transition-all ${
                  activeTab === key ? style.active : style.pill + ' hover:opacity-75'
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${activeTab === key ? 'bg-white/60' : style.dot}`} />
                {t.statuses[key].label}
                {count > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-white/25' : 'bg-black/10'}`}>
                    {count}
                  </span>
                )}
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
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-pink-100 p-10 flex flex-col items-center text-center">
                <span className="text-4xl mb-4 select-none">{STATUS_STYLES[activeTab].emoji}</span>
                <p className="font-playfair font-semibold text-gray-700 text-lg mb-2">{t.statuses[activeTab].label}</p>
                <p className="font-lato text-sm text-gray-400 max-w-xs">{t.empty}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    lang={lang}
                    t={t}
                    cancellingId={cancellingId}
                    setCancellingId={setCancellingId}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="text-center mt-10">
          <Link href="/boutique" className="inline-flex items-center gap-2 bg-primary hover:bg-pink-400 text-white font-lato font-semibold px-8 py-3.5 rounded-full transition-colors">
            <ShoppingBag size={16} />{t.shopBtn}
          </Link>
        </div>
      </div>
    </div>
  );
}
