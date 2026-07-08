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
  prenom: string;
  nom: string;
  name: string;       // = prenom + (nom ? ' ' + nom : '')
  email: string;
  telephone?: string;
  pseudo?: string;
  addresses: Address[];
  coupons: string[];
}

interface LoginData {
  prenom?: string;
  nom?: string;
  name?: string;
  email: string;
  telephone?: string;
  pseudo?: string;
  addresses?: Address[];
  coupons?: string[];
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  showAuthModal: boolean;
  registeredUsers: User[];
  login: (userData: LoginData) => void;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  updateUser: (updates: Partial<Pick<User, 'prenom' | 'nom' | 'name' | 'email' | 'telephone' | 'pseudo'>>) => void;
  registerUser: (data: { prenom: string; nom: string; email: string; telephone?: string; pseudo?: string; address?: Address }) => void;
  findUser: (identifier: string) => User | undefined;
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
      registeredUsers: [],

      login: (userData) => {
        const prenom = userData.prenom ?? '';
        const nom = userData.nom ?? '';
        const name = userData.name ?? (prenom + (nom ? ' ' + nom : '')).trim();
        set({
          isLoggedIn: true,
          user: {
            prenom,
            nom,
            name,
            email: userData.email,
            telephone: userData.telephone,
            pseudo: userData.pseudo ?? '',
            addresses: userData.addresses ?? [],
            coupons: userData.coupons ?? [],
          },
        });
      },

      logout: () => set({ isLoggedIn: false, user: null }),
      openAuthModal: () => set({ showAuthModal: true }),
      closeAuthModal: () => set({ showAuthModal: false }),

      updateUser: (updates) =>
        set((state) => {
          if (!state.user) return {};
          const next = { ...state.user, ...updates };
          if (updates.prenom !== undefined || updates.nom !== undefined) {
            next.name = (next.prenom + (next.nom ? ' ' + next.nom : '')).trim();
          }
          return { user: next };
        }),

      registerUser: ({ prenom, nom, email, telephone, pseudo, address }) => {
        const name = (prenom + (nom ? ' ' + nom : '')).trim();
        const newUser: User = {
          prenom,
          nom,
          name,
          email,
          telephone,
          pseudo: pseudo ?? '',
          addresses: address ? [address] : [],
          coupons: [],
        };
        set((state) => {
          const idx = state.registeredUsers.findIndex((u) => u.email === email);
          if (idx >= 0) {
            const updated = [...state.registeredUsers];
            updated[idx] = newUser;
            return { registeredUsers: updated };
          }
          return { registeredUsers: [...state.registeredUsers, newUser] };
        });
      },

      findUser: (identifier: string) => {
        const { registeredUsers } = get();
        const key = identifier.trim().toLowerCase();
        if (key.includes('@')) {
          return registeredUsers.find((u) => u.email.toLowerCase() === key);
        }
        return registeredUsers.find((u) => u.pseudo?.toLowerCase() === key);
      },

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
      name: 'bestie-auth-v1',
      skipHydration: true,
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        registeredUsers: state.registeredUsers,
      }),
    }
  )
);
