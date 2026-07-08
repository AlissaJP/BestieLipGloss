import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CustomerOrderStatus = 'attente' | 'valide' | 'livraison' | 'livre' | 'annule';
export type OrderPaymentMethod = 'moncash' | 'zelle' | 'card';

export interface StoredOrderItem {
  name: string;
  shade: string;
  quantity: number;
  price_htg: number;
  price_usd: number;
  image?: string;
  bgColor: string;
}

export interface StoredOrder {
  id: string;
  date: string;
  status: CustomerOrderStatus;
  // Identité du client au moment de la commande
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  // Preuve de paiement
  referenceTransaction?: string;  // Réf. Zelle / ID MonCash / last-4 carte
  payerInfo?: string;             // Numéro MonCash du payeur / Nom porteur carte
  items: StoredOrderItem[];
  subtotalUSD: number;
  discountAmountUSD?: number;
  promoCode?: string;
  deliveryFeeUSD: number;
  deliveryType?: 'standard' | 'express';
  total: number;
  totalUSD: number;
  deliveryAddress: string;
  instructionsLivraison?: string;
  paymentMethod: OrderPaymentMethod;
  devise: 'HTG' | 'USD';
}

interface OrdersState {
  orders: StoredOrder[];
  addOrder: (order: StoredOrder) => void;
  updateOrderStatus: (id: string, status: CustomerOrderStatus) => void;
  cancelOrder: (id: string) => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) =>
        set((state) => ({ orders: [order, ...state.orders] })),
      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),
      cancelOrder: (id) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status: 'annule' as CustomerOrderStatus } : o
          ),
        })),
    }),
    { name: 'bestie-orders-v1', skipHydration: true }
  )
);
