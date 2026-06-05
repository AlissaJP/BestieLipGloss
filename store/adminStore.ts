import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { products as staticProducts, type Product } from '@/data/products';

export type OrderStatus = 'pending' | 'paid' | 'shipping' | 'delivered';
export type PaymentMethod = 'moncash' | 'zelle' | 'cash';

export interface ManagedProduct extends Product {
  published: boolean;
}

export interface OrderItem {
  name: string;
  shade: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  paymentMethod: PaymentMethod;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  ordersCount: number;
  totalSpent: number;
}

interface AdminState {
  isLoggedIn: boolean;
  orders: Order[];
  customers: AdminCustomer[];
  managedProducts: ManagedProduct[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  addProduct: (p: Omit<ManagedProduct, 'id' | 'published'>) => void;
  updateProduct: (id: number, updates: Partial<Omit<ManagedProduct, 'id'>>) => void;
  deleteProduct: (id: number) => void;
  togglePublished: (id: number) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      orders: [],
      customers: [],
      managedProducts: staticProducts.map((p) => ({ ...p, published: true })),
      login: (username, password) => {
        if (username === 'admin' && password === 'bestie2024') {
          set({ isLoggedIn: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isLoggedIn: false }),
      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),
      addProduct: (p) =>
        set((state) => {
          const ids = state.managedProducts.map((mp) => mp.id);
          const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
          return {
            managedProducts: [
              ...state.managedProducts,
              { ...p, id: newId, published: false },
            ],
          };
        }),
      updateProduct: (id, updates) =>
        set((state) => ({
          managedProducts: state.managedProducts.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      deleteProduct: (id) =>
        set((state) => ({
          managedProducts: state.managedProducts.filter((p) => p.id !== id),
        })),
      togglePublished: (id) =>
        set((state) => ({
          managedProducts: state.managedProducts.map((p) =>
            p.id === id ? { ...p, published: !p.published } : p
          ),
        })),
    }),
    {
      name: 'bestie-admin-v2',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        orders: state.orders,
        managedProducts: state.managedProducts,
      }),
    }
  )
);
