import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  variantKey: string; // unique: `${id}` or `${id}::${variantId}`
  id: number;
  name: string;
  shade: string;
  price_htg: number;
  quantity: number;
  bgColor: string;
  image?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (variantKey: string) => void;
  updateQuantity: (variantKey: string, quantity: number) => void;
  updateItemVariant: (oldKey: string, patch: Pick<CartItem, 'variantKey' | 'shade' | 'image' | 'bgColor'>) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  // Appelé à la connexion : envoie le panier local au serveur puis charge le panier serveur
  syncCartOnLogin: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product) => {
        const existing = get().items.find((i) => i.variantKey === product.variantKey);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantKey === product.variantKey ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...product, quantity: 1 }] });
        }
      },

      removeItem: (variantKey) =>
        set({ items: get().items.filter((i) => i.variantKey !== variantKey) }),

      updateQuantity: (variantKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantKey);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variantKey === variantKey ? { ...i, quantity } : i
          ),
        });
      },

      updateItemVariant: (oldKey, patch) =>
        set({
          items: get().items.map((i) =>
            i.variantKey === oldKey ? { ...i, ...patch } : i
          ),
        }),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () =>
        get().items.reduce((acc, i) => acc + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((acc, i) => acc + i.price_htg * i.quantity, 0),

      syncCartOnLogin: async () => {
        const localItems = get().items;
        if (localItems.length > 0) {
          await Promise.allSettled(
            localItems.map((item) =>
              fetch('/api/panier/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_variant: item.variantKey, quantite: item.quantity }),
              })
            )
          );
        }
        const res = await fetch('/api/panier').catch(() => null);
        if (!res?.ok) return;
        const data = await res.json();
        // Remplace le local par le serveur seulement si la BDD renvoie des articles
        if (data.items && data.items.length > 0) {
          set({ items: data.items });
        }
      },
    }),
    { name: 'bestie-cart' }
  )
);
