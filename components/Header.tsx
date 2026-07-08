'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Menu, X, Search, User,
  LogOut, ChevronRight, Settings, Globe, Heart,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useLanguageStore, type Lang } from '@/store/languageStore';
import { useAdminStore } from '@/store/adminStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { translations } from '@/lib/translations';
import CartDrawer from './CartDrawer';

const LANGS: { code: Lang; flag: string; name: string }[] = [
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { openCart, totalItems } = useCartStore();
  const { items: favorites, lastAddedAt } = useFavoritesStore();
  const favoriteCount = favorites.length;
  const [heartPulse, setHeartPulse] = useState(false);
  const { isLoggedIn, user, logout } = useAuthStore();
  const { lang, setLang } = useLanguageStore();
  const { managedProducts } = useAdminStore();
  const router = useRouter();
  const t = translations[lang];
  const itemCount = totalItems();

  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (!q.trim()) return [];
    return managedProducts
      .filter((p) => p.published !== false)
      .filter((p) => {
        const hay = [p.name, p.shade, p.description]
          .join(' ').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        return hay.includes(q);
      })
      .slice(0, 5);
  }, [searchQuery, managedProducts]);

  const mobileResults = useMemo(() => {
    const q = mobileSearchQuery.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (!q.trim()) return [];
    return managedProducts
      .filter((p) => p.published !== false)
      .filter((p) => {
        const hay = [p.name, p.shade, p.description]
          .join(' ').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        return hay.includes(q);
      })
      .slice(0, 5);
  }, [mobileSearchQuery, managedProducts]);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/boutique', label: t.nav.shop },
    { href: '/#notre-histoire', label: t.nav.story },
  ];

  const userMenuItems = [
    { href: '/mon-compte', icon: User, label: t.auth.myAccount, desc: t.auth.myAccountSub },
    { href: '/mon-compte/informations', icon: Settings, label: t.auth.myInfo, desc: t.auth.myInfoSub },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setIsUserMenuOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setIsLangOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) closeSearch();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLang = (code: Lang) => {
    setLang(code);
    setIsLangOpen(false);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    window.location.href = '/';
  };

  // Pulse l'icône cœur chaque fois qu'un favori est ajouté
  useEffect(() => {
    if (lastAddedAt === 0) return;
    setHeartPulse(true);
    const t = setTimeout(() => setHeartPulse(false), 600);
    return () => clearTimeout(t);
  }, [lastAddedAt]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white/97 backdrop-blur-md shadow-sm' : 'bg-white/85 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24">

            {/* Logo */}
            <Link href="/" className="flex flex-col leading-none">
              <span className="font-greatvibes text-3xl lg:text-4xl text-primary">Bestie LipGloss</span>
              <span className="font-lato text-xs text-gray-400 tracking-[0.25em] uppercase">
                {translations[lang].common.tagline}
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8" aria-label={t.common.mainNav}>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className="font-lato text-lg text-gray-700 hover:text-primary transition-colors tracking-wide">
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Search (desktop) */}
              <div className="hidden sm:flex items-center relative" ref={searchRef}>
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div key="search-wrap"
                      initial={{ width: 0, opacity: 0 }} animate={{ width: 220, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-visible"
                    >
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') closeSearch();
                          if (e.key === 'Enter' && searchQuery.trim()) {
                            router.push(`/boutique?q=${encodeURIComponent(searchQuery.trim())}`);
                            closeSearch();
                          }
                        }}
                        placeholder={t.search.placeholder}
                        className="w-full font-lato text-sm border border-pink-200 rounded-full px-4 py-1.5 outline-none focus:border-primary bg-white"
                        autoFocus
                        aria-label={t.search.ariaInput}
                        aria-autocomplete="list"
                        aria-controls="search-results"
                      />
                      {/* Dropdown résultats */}
                      <AnimatePresence>
                        {searchQuery.trim() && (
                          <motion.div
                            id="search-results"
                            role="listbox"
                            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden z-50"
                          >
                            {searchResults.length === 0 ? (
                              <p className="font-lato text-sm text-gray-400 px-4 py-3 text-center">{t.search.noResults}</p>
                            ) : (
                              <>
                                {searchResults.map((p) => (
                                  <Link
                                    key={p.id}
                                    href={`/boutique/${p.slug}`}
                                    role="option"
                                    onClick={closeSearch}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition-colors border-b border-pink-50 last:border-0"
                                  >
                                    <div
                                      className="w-9 h-9 rounded-xl flex-shrink-0"
                                      style={{ background: p.bgColor || '#F2E9E1' }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-lato text-sm font-medium text-gray-800 truncate">{p.name}</p>
                                      <p className="font-lato text-xs text-gray-400 truncate">{p.shade}</p>
                                    </div>
                                    <span className="font-lato text-xs text-primary font-semibold shrink-0">${p.price_usd}</span>
                                  </Link>
                                ))}
                                {searchResults.length === 5 && (
                                  <Link
                                    href={`/boutique?q=${encodeURIComponent(searchQuery.trim())}`}
                                    onClick={closeSearch}
                                    className="block font-lato text-xs text-primary text-center py-2.5 hover:bg-pink-50 transition-colors font-semibold"
                                  >
                                    {t.search.viewAll} →
                                  </Link>
                                )}
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => {
                    if (isSearchOpen && !searchQuery) closeSearch();
                    else setIsSearchOpen(true);
                  }}
                  className="p-2 text-gray-600 hover:text-primary transition-colors rounded-full"
                  aria-label={t.search.ariaOpen}
                >
                  <Search size={22} />
                </button>
              </div>

              {/* Language globe dropdown — always visible */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className={`p-2 rounded-full transition-colors ${
                    isLangOpen ? 'text-primary bg-pink-50' : 'text-gray-600 hover:text-primary hover:bg-pink-50'
                  }`}
                  aria-label={t.lang.change}
                  aria-expanded={isLangOpen}
                >
                  <Globe size={22} />
                </button>
                <AnimatePresence>
                  {isLangOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full mt-2 w-40 bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden z-50 py-1"
                    >
                      {LANGS.map(({ code, flag, name }) => (
                        <button
                          key={code}
                          onClick={() => handleLang(code)}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 font-lato text-base transition-colors ${
                            lang === code
                              ? 'bg-pink-50 text-primary font-semibold'
                              : 'text-gray-600 hover:bg-pink-50'
                          }`}
                        >
                          <span className="text-base">{flag}</span>
                          <span className="flex-1 text-left">{name}</span>
                          {lang === code && <span className="text-primary text-xs">✓</span>}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Auth — desktop */}
              {isLoggedIn ? (
                <div className="hidden sm:block relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      isUserMenuOpen ? 'bg-pink-100 text-primary' : 'text-gray-600 hover:text-primary hover:bg-pink-50'
                    }`}
                    aria-label={t.auth.myAccount} aria-expanded={isUserMenuOpen}
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-lg select-none">👩🏾</div>
                    <span className="font-lato text-lg font-medium hidden sm:block max-w-[120px] truncate">
                      {user?.pseudo || user?.name?.split(' ')[0]}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden z-50"
                      >
                        {/* Profile header */}
                        <div className="px-4 py-3.5 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-lg flex-shrink-0 select-none">👩🏾</div>
                          <div className="min-w-0">
                            <p className="font-playfair font-semibold text-base text-gray-800 truncate">{user?.pseudo || user?.prenom || user?.name}</p>
                            <p className="font-lato text-sm text-gray-400 truncate">{user?.email}</p>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="py-1.5">
                          {userMenuItems.map(({ href, icon: Icon, label, desc }) => (
                            <Link key={label} href={href} onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-pink-50 transition-colors group">
                              <div className="w-8 h-8 rounded-lg bg-pink-50 group-hover:bg-white flex items-center justify-center flex-shrink-0 transition-colors">
                                <Icon size={15} className="text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-lato text-base font-medium text-gray-800 group-hover:text-primary transition-colors">{label}</p>
                                <p className="font-lato text-sm text-gray-400">{desc}</p>
                              </div>
                              <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                            </Link>
                          ))}
                        </div>

                        {/* Logout */}
                        <div className="border-t border-pink-100 py-1.5">
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors group">
                            <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-white flex items-center justify-center flex-shrink-0 transition-colors">
                              <LogOut size={15} className="text-red-400" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-lato text-base font-medium text-red-500 group-hover:text-red-600 transition-colors">{t.auth.logout}</p>
                              <p className="font-lato text-sm text-gray-400">{t.auth.logoutSub}</p>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/connexion"
                    className="font-lato text-base text-gray-600 hover:text-primary transition-colors px-3 py-1.5">
                    {t.auth.login}
                  </Link>
                  <Link href="/inscription"
                    className="font-lato text-base font-semibold bg-primary hover:bg-pink-400 text-white px-4 py-1.5 rounded-full transition-colors">
                    {t.auth.register}
                  </Link>
                </div>
              )}

              {/* Favoris — visible uniquement si connecté */}
              {isLoggedIn && (
                <Link href="/mon-compte/favoris"
                  className="relative p-2 text-gray-600 hover:text-primary transition-colors rounded-full"
                  aria-label="Mes favoris">
                  <motion.div
                    animate={heartPulse ? { scale: [1, 1.5, 0.9, 1.1, 1] } : { scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Heart
                      size={23}
                      className={favoriteCount > 0 ? 'fill-red-400 text-red-400' : ''}
                    />
                  </motion.div>
                </Link>
              )}

              {/* Cart — visible uniquement si connecté */}
              {isLoggedIn && (
                <button onClick={openCart}
                  className="relative p-2 text-gray-600 hover:text-primary transition-colors rounded-full"
                  aria-label={t.cart.ariaCartCount.replace('{n}', String(itemCount))}>
                  <ShoppingBag size={25} />
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span key={itemCount} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none"
                        aria-hidden="true">
                        {itemCount > 9 ? '9+' : itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              )}

              {/* Mobile hamburger */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-primary transition-colors rounded-full"
                aria-label={isMenuOpen ? t.common.closeMenu : t.common.openMenu} aria-expanded={isMenuOpen}>
                {isMenuOpen ? <X size={25} /> : <Menu size={25} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
              className="lg:hidden overflow-hidden bg-white border-t border-pink-100 shadow-lg"
            >
              <nav className="px-5 py-4 flex flex-col gap-1" aria-label={t.common.mobileNav}>
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}
                    className="font-lato text-base text-gray-700 hover:text-primary transition-colors py-3 border-b border-gray-50 min-h-[44px] flex items-center">
                    {link.label}
                  </Link>
                ))}

                {/* Mobile auth section */}
                <div className="pt-3 pb-1 border-t border-pink-100 mt-1">
                  {isLoggedIn ? (
                    <>
                      <div className="flex items-center gap-3 py-3 border-b border-gray-50">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-lg select-none">👩🏾</div>
                        <div>
                          <p className="font-lato text-sm font-semibold text-gray-800">{user?.pseudo || user?.prenom || user?.name}</p>
                          <p className="font-lato text-xs text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                      {userMenuItems.map(({ href, icon: Icon, label }) => (
                        <Link key={label} href={href} onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 py-2.5 text-gray-600 hover:text-primary transition-colors min-h-[44px]">
                          <Icon size={16} className="text-primary" />
                          <span className="font-lato text-sm">{label}</span>
                        </Link>
                      ))}
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 py-2.5 text-red-400 hover:text-red-500 transition-colors min-h-[44px] w-full mt-1">
                        <LogOut size={16} />
                        <span className="font-lato text-sm">{t.auth.logout}</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3 py-2">
                      <Link href="/connexion" onClick={() => setIsMenuOpen(false)}
                        className="w-full border border-primary text-primary font-lato font-semibold text-sm py-3 rounded-xl text-center hover:bg-pink-50 transition-colors">
                        {t.auth.login}
                      </Link>
                      <Link href="/inscription" onClick={() => setIsMenuOpen(false)}
                        className="w-full bg-primary hover:bg-pink-400 text-white font-lato font-semibold text-sm py-3 rounded-xl text-center transition-colors">
                        {t.auth.register}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mobile search */}
                <div className="pt-3 pb-1 border-t border-pink-100">
                  <input
                    type="text"
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && mobileSearchQuery.trim()) {
                        router.push(`/boutique?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
                        setIsMenuOpen(false);
                        setMobileSearchQuery('');
                      }
                    }}
                    placeholder={t.search.placeholderMobile}
                    className="w-full font-lato text-sm border border-pink-200 rounded-full px-4 py-2.5 outline-none focus:border-primary bg-gray-50"
                    aria-label={t.search.ariaInput}
                  />
                  {/* Résultats mobile */}
                  {mobileSearchQuery.trim() && (
                    <div className="mt-2 rounded-2xl border border-pink-100 overflow-hidden bg-white">
                      {mobileResults.length === 0 ? (
                        <p className="font-lato text-sm text-gray-400 px-4 py-3 text-center">{t.search.noResults}</p>
                      ) : (
                        mobileResults.map((p) => (
                          <Link
                            key={p.id}
                            href={`/boutique/${p.slug}`}
                            onClick={() => { setIsMenuOpen(false); setMobileSearchQuery(''); }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition-colors border-b border-pink-50 last:border-0"
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex-shrink-0"
                              style={{ background: p.bgColor || '#F2E9E1' }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-lato text-sm font-medium text-gray-800 truncate">{p.name}</p>
                              <p className="font-lato text-xs text-gray-400 truncate">{p.shade}</p>
                            </div>
                            <span className="font-lato text-xs text-primary font-semibold shrink-0">{p.price_htg} HTG</span>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartDrawer />
    </>
  );
}
