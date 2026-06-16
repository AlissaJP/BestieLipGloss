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
  }, []);
  return null;
}
