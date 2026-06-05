'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Clock, CreditCard, Truck, PackageCheck,
  LogOut, CheckCircle, ArrowRight, TrendingUp, ShoppingBag, X,
  Phone, Mail, MapPin, Calendar, ChevronRight, Search, Menu,
} from 'lucide-react';
import { useAdminStore, Order, OrderStatus, AdminCustomer } from '@/store/adminStore';
import { useLanguageStore, type Lang } from '@/store/languageStore';
import { translations } from '@/lib/translations';

type Tab = 'overview' | 'users' | 'pending' | 'paid' | 'shipping' | 'delivered';

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending:   'bg-amber-50  text-amber-600  border border-amber-100',
  paid:      'bg-green-50  text-green-600  border border-green-100',
  shipping:  'bg-blue-50   text-blue-600   border border-blue-100',
  delivered: 'bg-pink-50   text-primary    border border-pink-100',
};

const STATUS_BAR: Record<OrderStatus, string> = {
  pending:   'linear-gradient(180deg,#F59E0B,#FBBF24)',
  paid:      'linear-gradient(180deg,#22C55E,#4ADE80)',
  shipping:  'linear-gradient(180deg,#3B82F6,#60A5FA)',
  delivered: 'linear-gradient(180deg,#F2A7BB,#EFBBA6)',
};

const PAYMENT_LABEL: Record<string, string> = {
  moncash: '📱 MonCash',
  zelle:   '💸 Zelle',
  cash:    '💵 Cash',
};

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'en', flag: '🇺🇸', label: 'EN' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
];

function useT() {
  const { lang } = useLanguageStore();
  return translations[lang].admin;
}

function Badge({ status }: { status: OrderStatus }) {
  const t = useT();
  return (
    <span className={`inline-block font-lato text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLE[status]}`}>
      {t.status[status]}
    </span>
  );
}

function StatCard({ icon, label, value, sub, gradient }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; gradient: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-pink-100 p-4 md:p-5 overflow-hidden relative"
      style={{ boxShadow: '0 2px 16px rgba(242,167,187,0.10)' }}>
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-15 pointer-events-none" style={{ background: gradient }} />
      <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center mb-3 md:mb-4 shadow-sm" style={{ background: gradient }}>
        {icon}
      </div>
      <p className="font-lato text-[10px] text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="font-playfair font-bold text-2xl md:text-[26px] text-gray-800 leading-tight mt-0.5">{value}</p>
      {sub && <p className="font-lato text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5 md:mb-6">
      <h2 className="font-playfair font-bold text-xl md:text-2xl text-gray-800">{title}</h2>
      <p className="font-lato text-sm text-gray-400 mt-0.5">{subtitle}</p>
      <div className="mt-3 h-px w-16 rounded-full" style={{ background: 'linear-gradient(90deg,#F2A7BB,#EFBBA6)' }} />
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative mb-4 md:mb-5">
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 border border-pink-100 rounded-xl font-lato text-sm outline-none focus:border-primary/50 bg-white transition-colors"
        style={{ boxShadow: '0 1px 8px rgba(242,167,187,0.08)' }}
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
          <X size={13} />
        </button>
      )}
    </div>
  );
}

/* ─── Sidebar nav content (shared between desktop sidebar & mobile drawer) ─── */
function SidebarContent({
  navItems, tab, t, onSelect,
}: {
  navItems: { id: Tab; label: string; icon: React.ReactNode; count?: number }[];
  tab: Tab;
  t: ReturnType<typeof useT>;
  onSelect: (id: Tab) => void;
}) {
  return (
    <>
      <div className="px-5 py-5 border-b border-pink-50">
        <p className="font-lato text-[10px] text-gray-400 uppercase tracking-widest">{t.space}</p>
        <p className="font-playfair font-semibold text-gray-700 text-sm mt-0.5">{t.title}</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl font-lato text-sm transition-all ${
              tab === item.id
                ? 'text-primary font-semibold shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-pink-50/60'
            }`}
            style={tab === item.id ? { background: 'linear-gradient(135deg,rgba(242,167,187,0.18),rgba(239,187,166,0.12))' } : {}}
          >
            <span className="flex items-center gap-2.5">{item.icon}{item.label}</span>
            {item.count !== undefined && (
              <span className={`font-lato text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center transition-colors ${
                tab === item.id ? 'bg-primary/15 text-primary' : 'bg-pink-50 text-gray-400'
              }`}>
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-pink-50">
        <p className="font-lato text-[10px] text-gray-300">{t.connectedAs}</p>
      </div>
    </>
  );
}

/* ─── User detail drawer ─── */
function UserDrawer({ customer, orders, onClose }: {
  customer: AdminCustomer; orders: Order[]; onClose: () => void;
}) {
  const t = useT();
  const customerOrders = orders.filter((o) => o.customer === customer.name);

  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
          onClick={onClose}
        />
        <motion.aside
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-[#FAF9F7] z-40 overflow-y-auto flex flex-col"
          style={{ boxShadow: '-4px 0 40px rgba(242,167,187,0.18)' }}
        >
          <div className="px-5 md:px-6 py-5 flex items-center justify-between border-b border-pink-100 bg-white sticky top-0 z-10"
            style={{ boxShadow: '0 1px 12px rgba(242,167,187,0.10)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
                style={{ background: 'linear-gradient(135deg,#F2A7BB,#EFBBA6)' }}>
                <span className="font-playfair font-bold text-white text-base">{customer.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-playfair font-bold text-gray-800 text-base leading-tight">{customer.name}</p>
                <p className="font-lato text-xs text-gray-400">{customer.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-pink-50 hover:bg-pink-100 flex items-center justify-center transition-colors">
              <X size={15} className="text-gray-500" />
            </button>
          </div>

          <div className="flex-1 px-5 md:px-6 py-5 space-y-5">
            <div className="bg-white rounded-2xl border border-pink-100 p-5 space-y-3.5"
              style={{ boxShadow: '0 2px 12px rgba(242,167,187,0.08)' }}>
              <p className="font-lato text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.drawer.profile}</p>
              <div className="space-y-3">
                {[
                  { icon: <Mail size={13} className="text-primary" />, label: t.drawer.email, value: customer.email },
                  { icon: <Phone size={13} className="text-primary" />, label: t.drawer.phone, value: customer.phone },
                  { icon: <Calendar size={13} className="text-primary" />, label: t.drawer.memberSince, value: customer.joinDate },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-pink-50 flex items-center justify-center shrink-0">{icon}</div>
                    <div>
                      <p className="font-lato text-[10px] text-gray-400">{label}</p>
                      <p className="font-lato text-sm text-gray-700 font-medium break-all">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-pink-100 p-4 text-center"
                style={{ boxShadow: '0 2px 12px rgba(242,167,187,0.08)' }}>
                <p className="font-playfair font-bold text-2xl text-gray-800">{customer.ordersCount}</p>
                <p className="font-lato text-xs text-gray-400 mt-0.5">{t.drawer.orders}</p>
              </div>
              <div className="bg-white rounded-2xl border border-pink-100 p-4 text-center"
                style={{ boxShadow: '0 2px 12px rgba(242,167,187,0.08)' }}>
                <p className="font-playfair font-bold text-2xl text-primary">{customer.totalSpent.toLocaleString()}</p>
                <p className="font-lato text-xs text-gray-400 mt-0.5">{t.drawer.spent}</p>
              </div>
            </div>

            <div>
              <p className="font-lato text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{t.drawer.orderHistory}</p>
              {customerOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-pink-100 p-6 text-center">
                  <p className="font-lato text-sm text-gray-300 italic">{t.drawer.noOrders}</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {customerOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl border border-pink-100 p-4 relative overflow-hidden"
                      style={{ boxShadow: '0 2px 10px rgba(242,167,187,0.07)' }}>
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-2xl" style={{ background: STATUS_BAR[order.status] }} />
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-lato text-[11px] font-bold text-gray-300 bg-gray-50 px-1.5 py-0.5 rounded">{order.id}</span>
                            <Badge status={order.status} />
                          </div>
                          <div className="space-y-0.5">
                            {order.items.map((item, i) => (
                              <p key={i} className="font-lato text-xs text-gray-500">
                                {item.qty}× <span className="text-primary font-medium">{item.shade}</span>
                              </p>
                            ))}
                          </div>
                          <p className="font-lato text-xs text-gray-400">{order.date} · {PAYMENT_LABEL[order.paymentMethod]}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-playfair font-bold text-gray-800">{order.total.toLocaleString()} HTG</p>
                          <p className="font-lato text-[10px] text-gray-400 flex items-center gap-1 mt-1 justify-end">
                            <MapPin size={10} />{order.address.split(',')[0]}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.aside>
      </>
    </AnimatePresence>
  );
}

/* ─── Main dashboard ─── */
export default function AdminDashboard() {
  const router = useRouter();
  const { isLoggedIn, logout, orders, customers, updateOrderStatus } = useAdminStore();
  const { lang, setLang } = useLanguageStore();
  const t = translations[lang].admin;
  const [tab, setTab] = useState<Tab>('overview');
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn && !loggingOut) router.replace('/admin');
  }, [isLoggedIn, loggingOut, router]);

  if (!isLoggedIn) return null;

  const pending   = orders.filter((o) => o.status === 'pending');
  const paid      = orders.filter((o) => o.status === 'paid');
  const shipping  = orders.filter((o) => o.status === 'shipping');
  const delivered = orders.filter((o) => o.status === 'delivered');
  const revenue   = [...paid, ...shipping, ...delivered].reduce((s, o) => s + o.total, 0);

  const filteredCustomers = userSearch.trim()
    ? customers.filter((c) => {
        const q = userSearch.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q);
      })
    : customers;

  function filterOrders(list: Order[]) {
    if (!orderSearch.trim()) return list;
    const q = orderSearch.toLowerCase();
    return list.filter((o) => o.customer.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || o.address.toLowerCase().includes(q));
  }

  const handleLogout = () => { setLoggingOut(true); logout(); router.push('/'); };

  const navItems: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview',  label: t.nav.overview,  icon: <LayoutDashboard size={15} /> },
    { id: 'users',     label: t.nav.users,     icon: <Users size={15} />,        count: customers.length },
    { id: 'pending',   label: t.nav.pending,   icon: <Clock size={15} />,        count: pending.length },
    { id: 'paid',      label: t.nav.paid,      icon: <CreditCard size={15} />,   count: paid.length },
    { id: 'shipping',  label: t.nav.shipping,  icon: <Truck size={15} />,        count: shipping.length },
    { id: 'delivered', label: t.nav.delivered, icon: <PackageCheck size={15} />, count: delivered.length },
  ];

  const handleTabSelect = (id: Tab) => {
    setTab(id);
    setOrderSearch('');
    setMobileSidebarOpen(false);
  };

  const pendingAlert = pending.length > 0
    ? t.pendingAlert.replace('{n}', String(pending.length)).replace('{s}', pending.length > 1 ? 's' : '')
    : t.allUpToDate;

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col">

      {/* ── Top bar ── */}
      <header className="bg-white border-b border-pink-100 px-4 md:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20"
        style={{ boxShadow: '0 1px 20px rgba(242,167,187,0.12)' }}>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-gray-500 hover:bg-pink-100 transition-colors"
          >
            <Menu size={18} />
          </button>
          <span className="font-greatvibes text-[22px] md:text-[26px] text-primary leading-none" style={{ fontFamily: 'var(--font-greatvibes)' }}>
            Bestie LipGloss
          </span>
          <span className="hidden sm:inline font-lato text-[10px] font-bold uppercase tracking-wider text-primary/80 bg-pink-50 border border-pink-100 px-2.5 py-0.5 rounded-full">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Language switcher */}
          <div className="flex items-center gap-0.5 md:gap-1 bg-pink-50/60 border border-pink-100 rounded-xl p-1">
            {LANGS.map(({ code, flag, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`flex items-center gap-1 font-lato text-xs font-bold px-2 md:px-2.5 py-1.5 rounded-lg transition-all ${
                  lang === code ? 'bg-white text-primary shadow-sm border border-pink-100' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span>{flag}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="hidden md:block w-px h-5 bg-pink-100" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 md:gap-2 font-lato text-sm text-gray-400 hover:text-primary transition-colors px-2.5 md:px-3.5 py-2 rounded-xl hover:bg-pink-50"
          >
            <LogOut size={14} />
            <span className="hidden md:inline">{t.logout}</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar — desktop only ── */}
        <aside className="hidden md:flex w-60 bg-white border-r border-pink-100 flex-col shrink-0"
          style={{ boxShadow: '2px 0 20px rgba(242,167,187,0.06)' }}>
          <SidebarContent navItems={navItems} tab={tab} t={t} onSelect={handleTabSelect} />
        </aside>

        {/* ── Mobile sidebar drawer ── */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="fixed left-0 top-0 bottom-0 w-64 bg-white z-40 flex flex-col md:hidden"
                style={{ boxShadow: '4px 0 40px rgba(242,167,187,0.18)' }}
              >
                {/* Close button */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-pink-50">
                  <span className="font-greatvibes text-[22px] text-primary" style={{ fontFamily: 'var(--font-greatvibes)' }}>
                    Bestie LipGloss
                  </span>
                  <button onClick={() => setMobileSidebarOpen(false)}
                    className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-gray-400">
                    <X size={15} />
                  </button>
                </div>
                <SidebarContent navItems={navItems} tab={tab} t={t} onSelect={handleTabSelect} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >

              {/* ── Overview ── */}
              {tab === 'overview' && (
                <div className="space-y-5 md:space-y-7">
                  <div className="rounded-3xl p-5 md:p-6 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg,rgba(242,167,187,0.22) 0%,rgba(239,187,166,0.28) 100%)' }}>
                    <div className="absolute right-0 top-0 w-40 h-40 rounded-full opacity-20 pointer-events-none"
                      style={{ background: 'linear-gradient(135deg,#F2A7BB,#EFBBA6)', transform: 'translate(30%,-30%)' }} />
                    <p className="font-cormorant italic text-lg md:text-xl text-gray-600">{t.welcome}</p>
                    <p className="font-playfair font-bold text-xl md:text-2xl text-gray-800 mt-0.5">{t.welcomeSub}</p>
                    <p className="font-lato text-sm text-gray-500 mt-1.5">{pendingAlert}</p>
                  </div>

                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                    <StatCard icon={<Users size={16} className="text-white" />} label={t.stats.clients} value={customers.length} sub={t.stats.registered} gradient="linear-gradient(135deg,#A78BFA,#C4B5FD)" />
                    <StatCard icon={<Clock size={16} className="text-white" />} label={t.stats.pending} value={pending.length} sub={t.stats.toApprove} gradient="linear-gradient(135deg,#F59E0B,#FCD34D)" />
                    <StatCard icon={<Truck size={16} className="text-white" />} label={t.stats.shipping} value={shipping.length} sub={t.stats.onTheWay} gradient="linear-gradient(135deg,#3B82F6,#93C5FD)" />
                    <StatCard icon={<TrendingUp size={16} className="text-white" />} label={t.stats.revenue} value={revenue.toLocaleString()} sub={t.stats.cumulated} gradient="linear-gradient(135deg,#F2A7BB,#EFBBA6)" />
                  </div>

                  <div className="bg-white rounded-3xl border border-pink-100 overflow-hidden"
                    style={{ boxShadow: '0 2px 20px rgba(242,167,187,0.10)' }}>
                    <div className="px-5 md:px-6 py-4 border-b border-pink-50 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#F2A7BB,#EFBBA6)' }}>
                        <ShoppingBag size={13} className="text-white" />
                      </div>
                      <h3 className="font-playfair font-semibold text-gray-800">{t.recentOrders}</h3>
                    </div>
                    <div className="divide-y divide-pink-50/60">
                      {orders.slice(0, 8).map((order) => (
                        <div key={order.id} className="px-4 md:px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-pink-50/30 transition-colors">
                          <div className="flex items-center gap-2 md:gap-3 min-w-0">
                            <span className="font-lato text-[11px] font-bold text-gray-300 bg-gray-50 px-2 py-0.5 rounded-lg shrink-0 hidden sm:inline">{order.id}</span>
                            <div className="min-w-0">
                              <p className="font-lato text-sm font-medium text-gray-700 truncate">{order.customer}</p>
                              <p className="font-lato text-xs text-gray-400">{order.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3 shrink-0">
                            <span className="font-lato text-sm font-semibold text-gray-700 hidden sm:inline">{order.total.toLocaleString()} HTG</span>
                            <Badge status={order.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Users ── */}
              {tab === 'users' && (
                <div>
                  <SectionHeader
                    title={t.users.title}
                    subtitle={t.users.subtitle.replace('{n}', String(customers.length))}
                  />
                  <SearchBar value={userSearch} onChange={setUserSearch} placeholder={t.users.searchPlaceholder} />

                  {/* Mobile: cards */}
                  <div className="md:hidden space-y-3">
                    {filteredCustomers.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-pink-100 p-8 text-center">
                        <p className="font-lato text-sm text-gray-300 italic">{t.users.noResults}</p>
                      </div>
                    ) : filteredCustomers.map((c) => (
                      <button key={c.id} onClick={() => setSelectedCustomer(c)}
                        className="w-full bg-white rounded-2xl border border-pink-100 p-4 flex items-center justify-between gap-3 hover:bg-pink-50/30 transition-colors text-left"
                        style={{ boxShadow: '0 2px 12px rgba(242,167,187,0.08)' }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: 'linear-gradient(135deg,#F2A7BB,#EFBBA6)' }}>
                            <span className="font-lato font-bold text-xs text-white">{c.name.charAt(0)}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-lato text-sm font-semibold text-gray-700 truncate">{c.name}</p>
                            <p className="font-lato text-xs text-gray-400 truncate">{c.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <p className="font-playfair font-bold text-primary text-sm">{c.totalSpent.toLocaleString()} HTG</p>
                            <p className="font-lato text-xs text-gray-400">{c.ordersCount} cmd</p>
                          </div>
                          <ChevronRight size={15} className="text-gray-300" />
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Desktop: table */}
                  <div className="hidden md:block bg-white rounded-3xl border border-pink-100 overflow-hidden"
                    style={{ boxShadow: '0 2px 20px rgba(242,167,187,0.10)' }}>
                    {filteredCustomers.length === 0 ? (
                      <div className="p-12 text-center">
                        <p className="font-lato text-sm text-gray-300 italic">{t.users.noResults}</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-pink-50" style={{ background: 'linear-gradient(90deg,rgba(242,167,187,0.07),rgba(239,187,166,0.07))' }}>
                              {t.users.headers.map((h, i) => (
                                <th key={i} className={`font-lato text-[10px] font-bold text-gray-400 uppercase tracking-widest py-3.5 ${
                                  i === 0 ? 'pl-6 pr-4 text-left' : i >= 4 && i < 6 ? 'px-4 text-right' : 'px-4 text-left'
                                }`}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-pink-50/60">
                            {filteredCustomers.map((c) => (
                              <tr key={c.id} onClick={() => setSelectedCustomer(c)}
                                className="hover:bg-pink-50/30 transition-colors cursor-pointer group">
                                <td className="pl-6 pr-4 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                                      style={{ background: 'linear-gradient(135deg,#F2A7BB,#EFBBA6)' }}>
                                      <span className="font-lato font-bold text-xs text-white">{c.name.charAt(0)}</span>
                                    </div>
                                    <span className="font-lato text-sm font-medium text-gray-700">{c.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 font-lato text-sm text-gray-500">{c.email}</td>
                                <td className="px-4 py-4 font-lato text-sm text-gray-500">{c.phone}</td>
                                <td className="px-4 py-4 font-lato text-sm text-gray-400">{c.joinDate}</td>
                                <td className="px-4 py-4 text-right"><span className="font-lato text-sm font-semibold text-gray-700">{c.ordersCount}</span></td>
                                <td className="px-4 py-4 text-right"><span className="font-lato text-sm font-bold text-primary">{c.totalSpent.toLocaleString()} HTG</span></td>
                                <td className="px-4 py-4"><ChevronRight size={15} className="text-gray-300 group-hover:text-primary transition-colors ml-auto" /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Orders tabs ── */}
              {tab === 'pending' && (
                <OrdersSection title={t.sections.pending.title} subtitle={t.sections.pending.subtitle}
                  orders={filterOrders(pending)} search={orderSearch} onSearch={setOrderSearch}
                  searchPlaceholder={t.orders.searchPlaceholder} noResultsLabel={t.orders.noResults}
                  emptyLabel={t.orders.noOrdersMsg} emptyDesc={t.orders.noOrdersDesc}
                  actionLabel={t.orders.approve} actionIcon={<CheckCircle size={13} />}
                  nextStatus="paid" onAction={updateOrderStatus} statusLabels={t.status} />
              )}
              {tab === 'paid' && (
                <OrdersSection title={t.sections.paid.title} subtitle={t.sections.paid.subtitle}
                  orders={filterOrders(paid)} search={orderSearch} onSearch={setOrderSearch}
                  searchPlaceholder={t.orders.searchPlaceholder} noResultsLabel={t.orders.noResults}
                  emptyLabel={t.orders.noOrdersMsg} emptyDesc={t.orders.noOrdersDesc}
                  actionLabel={t.orders.ship} actionIcon={<Truck size={13} />}
                  nextStatus="shipping" onAction={updateOrderStatus} statusLabels={t.status} />
              )}
              {tab === 'shipping' && (
                <OrdersSection title={t.sections.shipping.title} subtitle={t.sections.shipping.subtitle}
                  orders={filterOrders(shipping)} search={orderSearch} onSearch={setOrderSearch}
                  searchPlaceholder={t.orders.searchPlaceholder} noResultsLabel={t.orders.noResults}
                  emptyLabel={t.orders.noOrdersMsg} emptyDesc={t.orders.noOrdersDesc}
                  actionLabel={t.orders.markDelivered} actionIcon={<PackageCheck size={13} />}
                  nextStatus="delivered" onAction={updateOrderStatus} statusLabels={t.status} />
              )}
              {tab === 'delivered' && (
                <OrdersSection
                  title={t.sections.delivered.title}
                  subtitle={t.sections.delivered.subtitle.replace('{n}', String(delivered.length)).replace('{s}', delivered.length > 1 ? 's' : '')}
                  orders={filterOrders(delivered)} search={orderSearch} onSearch={setOrderSearch}
                  searchPlaceholder={t.orders.searchPlaceholder} noResultsLabel={t.orders.noResults}
                  emptyLabel={t.orders.noOrdersMsg} emptyDesc={t.orders.noOrdersDesc}
                  onAction={updateOrderStatus} statusLabels={t.status} />
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {selectedCustomer && (
        <UserDrawer customer={selectedCustomer} orders={orders} onClose={() => setSelectedCustomer(null)} />
      )}
    </div>
  );
}

/* ─── OrdersSection ─── */
function OrdersSection({
  title, subtitle, orders, search, onSearch, searchPlaceholder, noResultsLabel,
  emptyLabel, emptyDesc, actionLabel, actionIcon, nextStatus, onAction, statusLabels,
}: {
  title: string; subtitle: string; orders: Order[];
  search: string; onSearch: (v: string) => void; searchPlaceholder: string; noResultsLabel: string;
  emptyLabel: string; emptyDesc: string;
  actionLabel?: string; actionIcon?: React.ReactNode;
  nextStatus?: OrderStatus; onAction: (id: string, status: OrderStatus) => void;
  statusLabels: Record<OrderStatus, string>;
}) {
  return (
    <div>
      <SectionHeader title={title} subtitle={subtitle} />
      <SearchBar value={search} onChange={onSearch} placeholder={searchPlaceholder} />
      {orders.length === 0 && !search ? (
        <div className="bg-white rounded-3xl border border-pink-100 p-12 md:p-16 text-center" style={{ boxShadow: '0 2px 20px rgba(242,167,187,0.08)' }}>
          <div className="text-4xl mb-3">💕</div>
          <p className="font-playfair text-gray-400 text-lg">{emptyLabel}</p>
          <p className="font-lato text-sm text-gray-300 mt-1">{emptyDesc}</p>
        </div>
      ) : orders.length === 0 && search ? (
        <div className="bg-white rounded-3xl border border-pink-100 p-12 text-center" style={{ boxShadow: '0 2px 20px rgba(242,167,187,0.08)' }}>
          <p className="font-lato text-sm text-gray-300 italic">{noResultsLabel}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {orders.map((order) => (
              <motion.div key={order.id} layout
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.22 }}
                className="bg-white rounded-2xl border border-pink-100 p-4 md:p-5 pl-5 md:pl-6 relative overflow-hidden"
                style={{ boxShadow: '0 2px 16px rgba(242,167,187,0.09)' }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: STATUS_BAR[order.status] }} />
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-3 md:gap-5">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-lato text-[11px] font-bold text-gray-300 bg-gray-50 px-2 py-0.5 rounded-lg">{order.id}</span>
                      <span className={`inline-block font-lato text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLE[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                      <span className="font-lato text-xs text-gray-400">{order.date}</span>
                    </div>
                    <p className="font-playfair font-semibold text-gray-800 text-base">{order.customer}</p>
                    <p className="font-lato text-xs text-gray-400">{order.phone}</p>
                    <p className="font-lato text-xs text-gray-500 flex items-start gap-1">
                      <span className="mt-0.5">📍</span><span>{order.address}</span>
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0">
                    <div className="sm:text-right space-y-1">
                      {order.items.map((item, i) => (
                        <p key={i} className="font-lato text-xs text-gray-500 hidden sm:block">
                          {item.qty}× <span className="text-primary font-medium">{item.shade}</span>
                        </p>
                      ))}
                      <p className="font-playfair font-bold text-base md:text-lg text-gray-800">{order.total.toLocaleString()} HTG</p>
                      <p className="font-lato text-xs text-gray-400">{PAYMENT_LABEL[order.paymentMethod]}</p>
                    </div>
                    {actionLabel && nextStatus && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAction(order.id, nextStatus)}
                        className="flex items-center gap-1.5 font-lato text-xs font-bold text-white px-3 md:px-4 py-2 rounded-xl shadow-sm shrink-0"
                        style={{ background: 'linear-gradient(135deg,#F2A7BB,#EFBBA6)' }}
                      >
                        {actionIcon}{actionLabel}<ArrowRight size={11} />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
