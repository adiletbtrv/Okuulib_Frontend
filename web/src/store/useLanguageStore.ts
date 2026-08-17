"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Language, translations, Translations } from "../lib/i18n/translations";

interface LanguageState {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "ky",
      t: translations.ky,
      setLanguage: (language: Language) => {
        set({
          language,
          t: translations[language] || translations.ky,
        });
        if (typeof document !== "undefined") {
          document.documentElement.lang = language;
        }
      },
    }),
    {
      name: "okuulib_language_v1",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.t = translations[state.language] || translations.ky;
          if (typeof document !== "undefined") {
            document.documentElement.lang = state.language;
          }
        }
      },
    }
  )
);
