import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderStatus = 'attente' | 'valide' | 'livraison' | 'livre' | 'annule';
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
  status: OrderStatus;
  items: StoredOrderItem[];
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
  cancelOrder: (id: string) => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) =>
        set((state) => ({ orders: [order, ...state.orders] })),
      cancelOrder: (id) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status: 'annule' as OrderStatus } : o
          ),
        })),
    }),
    { name: 'bestie-orders' }
  )
);
