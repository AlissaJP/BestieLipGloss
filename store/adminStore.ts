import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderStatus = 'pending' | 'paid' | 'shipping' | 'delivered';
export type PaymentMethod = 'moncash' | 'zelle' | 'cash';

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

const INITIAL_ORDERS: Order[] = [
  {
    id: 'CMD-001', customer: 'Marie-Claire Joseph', phone: '+509 3741-2234',
    address: 'Delmas 33, #14, Port-au-Prince',
    items: [{ name: 'La Rosée Matinale', shade: 'Cherry', qty: 2, price: 500 }],
    total: 1000, status: 'pending', date: '2026-06-05', paymentMethod: 'moncash',
  },
  {
    id: 'CMD-002', customer: 'Nadia Pierre', phone: '+509 3612-5578',
    address: 'Pétion-Ville, Rue Lamarre',
    items: [
      { name: 'La Rosée Matinale', shade: 'Honey Rose', qty: 1, price: 500 },
      { name: 'La Rosée Matinale', shade: 'Strawberry', qty: 1, price: 500 },
    ],
    total: 1000, status: 'pending', date: '2026-06-05', paymentMethod: 'moncash',
  },
  {
    id: 'CMD-003', customer: 'Roseline Augustin', phone: '+1 786-234-5678',
    address: '123 NW 7th Ave, Miami FL 33126',
    items: [{ name: 'La Rosée Matinale', shade: 'Rouge Grenat', qty: 3, price: 500 }],
    total: 1500, status: 'pending', date: '2026-06-04', paymentMethod: 'zelle',
  },
  {
    id: 'CMD-004', customer: 'Daniella François', phone: '+509 4801-3392',
    address: 'Carrefour, Zone Ibo',
    items: [{ name: 'La Rosée Matinale', shade: 'Cherry', qty: 1, price: 500 }],
    total: 650, status: 'pending', date: '2026-06-04', paymentMethod: 'cash',
  },
  {
    id: 'CMD-005', customer: 'Jessica Blanc', phone: '+509 3455-7821',
    address: 'Tabarre 41, Port-au-Prince',
    items: [{ name: 'La Rosée Matinale', shade: 'Strawberry', qty: 2, price: 500 }],
    total: 1200, status: 'paid', date: '2026-06-03', paymentMethod: 'moncash',
  },
  {
    id: 'CMD-006', customer: 'Claudine Mercier', phone: '+1 954-321-0987',
    address: '456 Palm Dr, Fort Lauderdale FL',
    items: [{ name: 'La Rosée Matinale', shade: 'Honey Rose', qty: 4, price: 500 }],
    total: 2000, status: 'paid', date: '2026-06-03', paymentMethod: 'zelle',
  },
  {
    id: 'CMD-007', customer: 'Sophonie Dorcé', phone: '+509 3811-4423',
    address: 'Cap-Haïtien, Rue 15',
    items: [{ name: 'La Rosée Matinale', shade: 'Cherry', qty: 1, price: 500 }],
    total: 850, status: 'paid', date: '2026-06-02', paymentMethod: 'moncash',
  },
  {
    id: 'CMD-008', customer: 'Kimberly Saint-Fleur', phone: '+509 3624-9910',
    address: 'Delmas 19, Ruelle Borno',
    items: [
      { name: 'La Rosée Matinale', shade: 'Strawberry', qty: 1, price: 500 },
      { name: 'La Rosée Matinale', shade: 'Rouge Grenat', qty: 1, price: 500 },
    ],
    total: 1350, status: 'shipping', date: '2026-06-01', paymentMethod: 'moncash',
  },
  {
    id: 'CMD-009', customer: 'Vanessa Dumé', phone: '+509 4711-2256',
    address: 'Gonaïves, Rue Dr Aubry',
    items: [{ name: 'La Rosée Matinale', shade: 'Honey Rose', qty: 2, price: 500 }],
    total: 1400, status: 'shipping', date: '2026-05-31', paymentMethod: 'moncash',
  },
  {
    id: 'CMD-010', customer: 'Magalie Toussaint', phone: '+1 617-890-1234',
    address: '789 Tremont St, Boston MA',
    items: [{ name: 'La Rosée Matinale', shade: 'Cherry', qty: 5, price: 500 }],
    total: 2500, status: 'shipping', date: '2026-05-30', paymentMethod: 'zelle',
  },
  {
    id: 'CMD-011', customer: 'Christelle Dorval', phone: '+509 3500-1122',
    address: 'Pétion-Ville, Rte de Frères',
    items: [{ name: 'La Rosée Matinale', shade: 'Strawberry', qty: 1, price: 500 }],
    total: 700, status: 'delivered', date: '2026-05-28', paymentMethod: 'moncash',
  },
  {
    id: 'CMD-012', customer: 'Stephanie Alexis', phone: '+509 3902-3344',
    address: 'Croix-des-Bouquets, Centre',
    items: [{ name: 'La Rosée Matinale', shade: 'Cherry', qty: 2, price: 500 }],
    total: 1150, status: 'delivered', date: '2026-05-27', paymentMethod: 'moncash',
  },
  {
    id: 'CMD-013', customer: 'Sandra Hyppolite', phone: '+1 305-555-7890',
    address: 'Miami FL, Little Haiti',
    items: [{ name: 'La Rosée Matinale', shade: 'Rouge Grenat', qty: 2, price: 500 }],
    total: 1000, status: 'delivered', date: '2026-05-25', paymentMethod: 'zelle',
  },
  {
    id: 'CMD-014', customer: 'Flore Jean-Baptiste', phone: '+509 3411-6677',
    address: 'Jacmel, Rue St-Philippe',
    items: [{ name: 'La Rosée Matinale', shade: 'Honey Rose', qty: 1, price: 500 }],
    total: 900, status: 'delivered', date: '2026-05-22', paymentMethod: 'cash',
  },
  {
    id: 'CMD-015', customer: 'Marie-Rose Dorismond', phone: '+509 3788-4455',
    address: 'Port-au-Prince, Lalue',
    items: [
      { name: 'La Rosée Matinale', shade: 'Cherry', qty: 1, price: 500 },
      { name: 'La Rosée Matinale', shade: 'Honey Rose', qty: 1, price: 500 },
    ],
    total: 1200, status: 'delivered', date: '2026-05-20', paymentMethod: 'moncash',
  },
];

const INITIAL_CUSTOMERS: AdminCustomer[] = [
  { id: 'USR-001', name: 'Marie-Claire Joseph', email: 'marie@example.com', phone: '+509 3741-2234', joinDate: '2026-03-15', ordersCount: 3, totalSpent: 2850 },
  { id: 'USR-002', name: 'Nadia Pierre', email: 'nadia.pierre@gmail.com', phone: '+509 3612-5578', joinDate: '2026-04-02', ordersCount: 2, totalSpent: 1700 },
  { id: 'USR-003', name: 'Roseline Augustin', email: 'rose.aug@gmail.com', phone: '+1 786-234-5678', joinDate: '2026-04-18', ordersCount: 1, totalSpent: 1500 },
  { id: 'USR-004', name: 'Daniella François', email: 'dani.f@yahoo.com', phone: '+509 4801-3392', joinDate: '2026-05-01', ordersCount: 1, totalSpent: 650 },
  { id: 'USR-005', name: 'Jessica Blanc', email: 'jess.blanc@gmail.com', phone: '+509 3455-7821', joinDate: '2026-04-10', ordersCount: 2, totalSpent: 2100 },
  { id: 'USR-006', name: 'Claudine Mercier', email: 'c.mercier@outlook.com', phone: '+1 954-321-0987', joinDate: '2026-03-22', ordersCount: 4, totalSpent: 5200 },
  { id: 'USR-007', name: 'Kimberly Saint-Fleur', email: 'kim.sf@gmail.com', phone: '+509 3624-9910', joinDate: '2026-05-08', ordersCount: 1, totalSpent: 1350 },
  { id: 'USR-008', name: 'Magalie Toussaint', email: 'mag.tous@gmail.com', phone: '+1 617-890-1234', joinDate: '2026-02-14', ordersCount: 5, totalSpent: 7500 },
];

interface AdminState {
  isLoggedIn: boolean;
  orders: Order[];
  customers: AdminCustomer[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      orders: INITIAL_ORDERS,
      customers: INITIAL_CUSTOMERS,
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
    }),
    {
      name: 'bestie-admin',
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn, orders: state.orders }),
    }
  )
);
