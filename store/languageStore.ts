import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'fr' | 'en' | 'es';

interface LanguageState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      lang: 'fr',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'bestie-lang' }
  )
);
