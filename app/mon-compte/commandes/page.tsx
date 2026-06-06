'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

const STATUSES = [
  {
    key: 'attente',
    label: 'Pending',
    desc: 'Payment validation in progress',
    emoji: '⏳',
    pill: 'bg-orange-100 text-orange-700',
    active: 'bg-orange-500 text-white shadow-sm shadow-orange-200',
    dot: 'bg-orange-400',
  },
  {
    key: 'valide',
    label: 'Payment Confirmed',
    desc: 'Order confirmed, being prepared',
    emoji: '✅',
    pill: 'bg-blue-100 text-blue-700',
    active: 'bg-blue-500 text-white shadow-sm shadow-blue-200',
    dot: 'bg-blue-400',
  },
  {
    key: 'livraison',
    label: 'In Delivery',
    desc: 'Your order is on its way',
    emoji: '🛵',
    pill: 'bg-purple-100 text-purple-700',
    active: 'bg-purple-500 text-white shadow-sm shadow-purple-200',
    dot: 'bg-purple-400',
  },
  {
    key: 'livre',
    label: 'Delivered',
    desc: 'Orders already received',
    emoji: '💕',
    pill: 'bg-green-100 text-green-700',
    active: 'bg-green-500 text-white shadow-sm shadow-green-200',
    dot: 'bg-green-400',
  },
  {
    key: 'annule',
    label: 'Cancelled',
    desc: 'Order and delivery cancelled',
    emoji: '🚫',
    pill: 'bg-gray-100 text-gray-500',
    active: 'bg-gray-500 text-white shadow-sm shadow-gray-200',
    dot: 'bg-gray-400',
  },
];

export default function CommandesPage() {
  const [activeTab, setActiveTab] = useState('attente');
  const active = STATUSES.find((s) => s.key === activeTab)!;

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          href="/mon-compte"
          className="inline-flex items-center gap-2 font-lato text-sm text-gray-500 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Back to my account
        </Link>

        <h1 className="font-playfair font-bold text-3xl text-gray-800 mb-2">My Orders</h1>
        <p className="font-lato text-sm text-gray-500 mb-8">
          Track all your Bestie orders here.
        </p>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {STATUSES.map((status) => (
            <button
              key={status.key}
              onClick={() => setActiveTab(status.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-lato text-sm font-medium transition-all ${
                activeTab === status.key ? status.active : status.pill + ' hover:opacity-75'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  activeTab === status.key ? 'bg-white/60' : status.dot
                }`}
              />
              {status.label}
            </button>
          ))}
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
            <div className="bg-white rounded-2xl border border-pink-100 p-10 flex flex-col items-center text-center">
              <span className="text-4xl mb-4 select-none">{active.emoji}</span>
              <p className="font-playfair font-semibold text-gray-700 text-lg mb-2">
                No &ldquo;{active.label}&rdquo; orders
              </p>
              <p className="font-lato text-sm text-gray-400 max-w-xs">
                {active.desc}. Your orders will appear here as you make purchases.
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="text-center mt-10">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 bg-primary hover:bg-pink-400 text-white font-lato font-semibold px-8 py-3.5 rounded-full transition-colors"
          >
            <ShoppingBag size={16} />
            Discover the shop
          </Link>
        </div>
      </div>
    </div>
  );
}
