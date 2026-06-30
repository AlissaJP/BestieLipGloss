import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/data/products';

interface FavoritesState {
  items: Product[];
  lastAddedAt: number;  // timestamp mis à jour uniquement lors d'un ajout (pour animation)
  toggleFavorite: (product: Product) => void;
  isFavorite: (id: number) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      lastAddedAt: 0,
      toggleFavorite: (product) => {
        const exists = get().items.find((p) => p.id === product.id);
        if (exists) {
          set({ items: get().items.filter((p) => p.id !== product.id) });
        } else {
          set({ items: [...get().items, product], lastAddedAt: Date.now() });
        }
      },
      isFavorite: (id) => !!get().items.find((p) => p.id === id),
    }),
    { name: 'bestie-favorites-v2', skipHydration: true }
  )
);
