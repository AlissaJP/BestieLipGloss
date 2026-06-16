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
      lang: 'en',
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'bestie-lang',
      version: 1,
      skipHydration: true,
      migrate: (_state: unknown, _fromVersion: number) => ({ lang: 'en' as Lang }),
    }
  )
);
