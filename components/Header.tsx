'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Menu, X, Search, User,
  LogOut, ChevronRight, Settings,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useLanguageStore, type Lang } from '@/store/languageStore';
import { translations } from '@/lib/translations';
import CartDrawer from './CartDrawer';

const LANGS: { code: Lang; flag: string }[] = [
  { code: 'fr', flag: '🇫🇷' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'es', flag: '🇪🇸' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  const { openCart, totalItems } = useCartStore();
  const { isLoggedIn, user, logout } = useAuthStore();
  const { lang, setLang } = useLanguageStore();
  const router = useRouter();
  const t = translations[lang];
  const itemCount = totalItems();

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/boutique', label: t.nav.shop },
    { href: '/#notre-histoire', label: t.nav.story },
    { href: '/comment-commander', label: t.nav.howTo },
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLang = (code: Lang) => {
    setLang(code);
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    router.push('/');
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white/97 backdrop-blur-md shadow-sm' : 'bg-white/85 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link href="/" className="flex flex-col leading-none">
              <span className="font-greatvibes text-2xl lg:text-3xl text-primary">Bestie LipGloss</span>
              <span className="font-lato text-[10px] text-gray-400 tracking-[0.25em] uppercase hidden sm:block">
                Beauté Haïtienne Naturelle
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Navigation principale">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className="font-lato text-sm text-gray-700 hover:text-primary transition-colors tracking-wide">
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Search (desktop) */}
              <div className="hidden sm:flex items-center">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.input key="search"
                      initial={{ width: 0, opacity: 0 }} animate={{ width: 180, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      type="text" placeholder={t.search.placeholder}
                      className="font-lato text-sm border border-pink-200 rounded-full px-4 py-1.5 outline-none focus:border-primary bg-white"
                      autoFocus onBlur={() => setIsSearchOpen(false)} aria-label="Recherche"
                    />
                  )}
                </AnimatePresence>
                <button onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 text-gray-600 hover:text-primary transition-colors rounded-full"
                  aria-label="Ouvrir la recherche">
                  <Search size={19} />
                </button>
              </div>

              {/* Auth — desktop */}
              {isLoggedIn ? (
                <div className="hidden sm:block relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                      isUserMenuOpen ? 'bg-pink-100 text-primary' : 'text-gray-600 hover:text-primary hover:bg-pink-50'
                    }`}
                    aria-label={t.auth.myAccount} aria-expanded={isUserMenuOpen}
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-sm select-none">👩🏾</div>
                    <span className="font-lato text-sm font-medium hidden md:block max-w-[80px] truncate">
                      {user?.name?.split(' ')[0]}
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
                            <p className="font-playfair font-semibold text-sm text-gray-800 truncate">{user?.name}</p>
                            <p className="font-lato text-xs text-gray-400 truncate">{user?.email}</p>
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
                                <p className="font-lato text-sm font-medium text-gray-800 group-hover:text-primary transition-colors">{label}</p>
                                <p className="font-lato text-xs text-gray-400">{desc}</p>
                              </div>
                              <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                            </Link>
                          ))}
                        </div>

                        {/* Language switcher */}
                        <div className="border-t border-pink-100 px-4 py-3">
                          <p className="font-lato text-[10px] text-gray-400 uppercase tracking-widest mb-2">{t.lang.label}</p>
                          <div className="flex gap-1.5">
                            {LANGS.map(({ code, flag }) => (
                              <button
                                key={code}
                                onClick={() => handleLang(code)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-lato text-xs transition-colors flex-1 justify-center ${
                                  lang === code
                                    ? 'bg-primary text-white font-semibold'
                                    : 'bg-pink-50 text-gray-600 hover:bg-pink-100'
                                }`}
                              >
                                <span>{flag}</span>
                                <span className="uppercase font-semibold">{code}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-pink-100 py-1.5">
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors group">
                            <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-white flex items-center justify-center flex-shrink-0 transition-colors">
                              <LogOut size={15} className="text-red-400" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-lato text-sm font-medium text-red-500 group-hover:text-red-600 transition-colors">{t.auth.logout}</p>
                              <p className="font-lato text-xs text-gray-400">{t.auth.logoutSub}</p>
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
                    className="font-lato text-sm text-gray-600 hover:text-primary transition-colors px-3 py-1.5">
                    {t.auth.login}
                  </Link>
                  <Link href="/inscription"
                    className="font-lato text-sm font-semibold bg-primary hover:bg-pink-400 text-white px-4 py-1.5 rounded-full transition-colors">
                    {t.auth.register}
                  </Link>
                </div>
              )}

              {/* Cart — visible uniquement si connecté */}
              {isLoggedIn && (
                <button onClick={openCart}
                  className="relative p-2 text-gray-600 hover:text-primary transition-colors rounded-full"
                  aria-label={`Panier (${itemCount} articles)`}>
                  <ShoppingBag size={22} />
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
                aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={isMenuOpen}>
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
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
              <nav className="px-5 py-4 flex flex-col gap-1" aria-label="Navigation mobile">
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
                          <p className="font-lato text-sm font-semibold text-gray-800">{user?.name}</p>
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
                <div className="pt-2 pb-1 border-t border-pink-100">
                  <input type="text" placeholder={t.search.placeholderMobile}
                    className="w-full font-lato text-sm border border-pink-200 rounded-full px-4 py-2.5 outline-none focus:border-primary bg-gray-50"
                    aria-label="Recherche mobile" />
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
