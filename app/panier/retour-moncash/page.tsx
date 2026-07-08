'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useOrdersStore, type StoredOrder } from '@/store/ordersStore';

export default function RetourMoncashPage() {
  const { addOrder } = useOrdersStore();
  const { clearCart } = useCartStore();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const verify = async () => {
      const raw = sessionStorage.getItem('moncash_pending_order');
      if (!raw) {
        setErrorMsg('Aucune commande en attente de paiement MonCash trouvée.');
        setStatus('error');
        return;
      }

      let pendingOrder: StoredOrder;
      try {
        pendingOrder = JSON.parse(raw) as StoredOrder;
        setOrderId(pendingOrder.id);
      } catch {
        setErrorMsg('Données de commande invalides.');
        setStatus('error');
        return;
      }

      try {
        const amountToken = sessionStorage.getItem('moncash_amount_token') ?? '';
        const params = new URLSearchParams({ orderId: pendingOrder.id });
        if (amountToken) params.set('amountToken', amountToken);
        const res = await fetch(`/api/paiement/moncash/verifier?${params.toString()}`);
        const data = await res.json() as { success?: boolean; error?: string; transaction_id?: string; payer?: string };

        if (!res.ok || !data.success) {
          setErrorMsg(data.error ?? 'Le paiement MonCash n\'a pas pu être confirmé. Votre panier est intact — vous pouvez réessayer.');
          setStatus('error');
          return;
        }

        // Enrichit la commande avec la référence MonCash retournée par l'API
        addOrder({
          ...pendingOrder,
          referenceTransaction: data.transaction_id ?? undefined,
          payerInfo: data.payer ?? undefined,
        });
        clearCart();
        sessionStorage.removeItem('moncash_pending_order');
        sessionStorage.removeItem('moncash_amount_token');
        setStatus('success');
      } catch {
        setErrorMsg('Erreur de connexion lors de la vérification. Votre panier est intact.');
        setStatus('error');
      }
    };

    verify();
  }, [addOrder, clearCart]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-[#F2E9E1] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="font-lato text-gray-600">Vérification de votre paiement MonCash…</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#F2E9E1] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-sm border border-pink-100 p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-red-500" />
          </div>
          <h1 className="font-playfair font-bold text-xl text-gray-800 mb-2">Paiement non confirmé</h1>
          <p className="font-lato text-sm text-gray-500 mb-6">{errorMsg}</p>
          <Link
            href="/panier"
            className="block w-full bg-primary hover:bg-pink-400 text-white font-lato font-semibold py-3 rounded-xl transition-colors text-center"
          >
            Retour au panier
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2E9E1] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-sm border border-pink-100 p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={40} className="text-green-500" />
        </motion.div>
        <h1 className="font-playfair font-bold text-2xl text-gray-800 mb-2">Paiement confirmé !</h1>
        <p className="font-lato text-sm text-gray-500 mb-4">Merci pour votre commande Bestie LipGloss.</p>
        {orderId && (
          <div className="bg-gray-50 rounded-xl px-4 py-2.5 inline-block border border-gray-100 mb-6">
            <p className="font-lato text-[10px] text-gray-400 mb-0.5">Numéro de commande</p>
            <p className="font-playfair font-bold text-gray-800 tracking-wider text-sm">{orderId}</p>
          </div>
        )}
        <p className="font-lato text-xs text-gray-400 mb-6">
          Vous pouvez suivre l'état de votre commande dans Mon compte.
        </p>
        <div className="space-y-3">
          <Link
            href="/mon-compte/commandes"
            className="block w-full bg-primary hover:bg-pink-400 text-white font-lato font-semibold py-3 rounded-xl transition-colors text-center"
          >
            Voir mes commandes
          </Link>
          <Link
            href="/boutique"
            className="block w-full border border-pink-200 text-gray-600 hover:border-primary hover:text-primary font-lato py-3 rounded-xl transition-colors text-center text-sm"
          >
            Continuer mes achats
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
