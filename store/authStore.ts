import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Address {
  id: string;
  label: string;
  country?: 'ht' | 'us';
  adresse: string;
  departement?: string;
  ville: string;
  quartier?: string;
  state?: string;
  zipCode?: string;
}

export interface User {
  name: string;
  email: string;
  pseudo?: string;
  addresses: Address[];
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  showAuthModal: boolean;
  login: (userData: { name: string; email: string }) => void;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  updateUser: (updates: Partial<Pick<User, 'name' | 'email' | 'pseudo'>>) => void;
  addAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      showAuthModal: false,
      login: (userData) =>
        set({ isLoggedIn: true, user: { ...userData, pseudo: '', addresses: [] } }),
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
    }),
    {
      name: 'bestie-auth',
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn, user: state.user }),
    }
  )
);
