"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Sun, Moon, Laptop, Check } from "lucide-react";
import { useLanguageStore } from "../../store/useLanguageStore";
import { useThemeStore } from "../../store/useThemeStore";
import { Language } from "../../lib/i18n/translations";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "ky", label: "Кыргызча", flag: "🇰🇬" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export function LanguageThemeControls() {
  const { language, setLanguage, t } = useLanguageStore();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore();

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Language Switcher */}
      <div className="relative" ref={langRef}>
        <button
          onClick={() => setShowLangMenu((p) => !p)}
          className="flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          title="Тил тандоо / Change language"
        >
          <span className="text-sm">{currentLang.flag}</span>
          <span className="hidden sm:inline uppercase">{currentLang.code}</span>
        </button>

        {showLangMenu && (
          <div className="absolute right-0 top-11 z-50 w-44 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-1.5 shadow-xl shadow-gray-200/50 dark:shadow-none animate-in fade-in-50 zoom-in-95 duration-100">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLanguage(l.code);
                  setShowLangMenu(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors ${
                  language === l.code
                    ? "bg-[#E84326]/10 text-[#E84326] font-bold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{l.flag}</span>
                  <span>{l.label}</span>
                </div>
                {language === l.code && <Check className="h-3.5 w-3.5 text-[#E84326]" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme Toggle */}
      {mounted && (
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          title={resolvedTheme === "light" ? "Караңгы тема / Dark Mode" : "Жарык тема / Light Mode"}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-gray-700" />
          )}
        </button>
      )}
    </div>
  );
}
