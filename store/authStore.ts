import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Address {
  id: string;
  label: string;
  country?: string;
  adresse: string;
  departement?: string;
  ville: string;
  quartier?: string;
  state?: string;
  zipCode?: string;
  instructions_livraison?: string;
  est_principale?: boolean;
}

export interface User {
  name: string;
  email: string;
  telephone?: string;
  pseudo?: string;
  addresses: Address[];
  coupons: string[];
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  showAuthModal: boolean;
  login: (userData: { name: string; email: string; telephone?: string; pseudo?: string }) => void;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  updateUser: (updates: Partial<Pick<User, 'name' | 'email' | 'telephone' | 'pseudo'>>) => void;
  addAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  addCoupon: (code: string) => void;
  removeCoupon: (code: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      showAuthModal: false,
      login: (userData) =>
        set({ isLoggedIn: true, user: { ...userData, pseudo: userData.pseudo ?? '', addresses: [], coupons: [] } }),
      logout: () => set({ isLoggedIn: false, user: null }),
      openAuthModal: () => set({ showAuthModal: true }),
      closeAuthModal: () => set({ showAuthModal: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      addAddress: (address) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, addresses: [...(state.user.addresses ?? []), address] }
            : null,
        })),
      removeAddress: (id) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, addresses: (state.user.addresses ?? []).filter((a) => a.id !== id) }
            : null,
        })),
      addCoupon: (code) =>
        set((state) => {
          if (!state.user) return {};
          const upper = code.toUpperCase().trim();
          const existing = state.user.coupons ?? [];
          if (existing.includes(upper)) return {};
          return { user: { ...state.user, coupons: [...existing, upper] } };
        }),
      removeCoupon: (code) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, coupons: (state.user.coupons ?? []).filter((c) => c !== code) }
            : null,
        })),
    }),
    {
      name: 'bestie-auth',
      skipHydration: true,
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn, user: state.user }),
    }
  )
);
