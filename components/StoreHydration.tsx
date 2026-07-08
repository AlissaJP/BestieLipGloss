'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useAdminStore } from '@/store/adminStore';
import { useLanguageStore } from '@/store/languageStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useOrdersStore } from '@/store/ordersStore';

export default function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
    useAdminStore.persist.rehydrate();
    useLanguageStore.persist.rehydrate();
    useFavoritesStore.persist.rehydrate();
    useOrdersStore.persist.rehydrate();

    // Sync cross-tab : quand un autre onglet modifie localStorage,
    // on rehydrate le store concerné pour que l'admin voit les nouvelles
    // inscriptions/commandes sans avoir à rafraîchir la page.
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'bestie-auth-v1')      useAuthStore.persist.rehydrate();
      if (e.key === 'bestie-orders-v1')    useOrdersStore.persist.rehydrate();
      if (e.key === 'bestie-cart-v1')      useCartStore.persist.rehydrate();
      if (e.key === 'bestie-favorites-v1') useFavoritesStore.persist.rehydrate();
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
  return null;
}
