"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function applyThemeToDocument(theme: Theme): "light" | "dark" {
  if (typeof window === "undefined") return "light";

  let active: "light" | "dark" = "light";
  if (theme === "system") {
    active = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } else {
    active = theme;
  }

  const root = document.documentElement;
  if (active === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  }

  return active;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      resolvedTheme: "light",
      setTheme: (theme: Theme) => {
        const resolved = applyThemeToDocument(theme);
        set({ theme, resolvedTheme: resolved });
      },
      toggleTheme: () => {
        const current = get().resolvedTheme;
        const next = current === "light" ? "dark" : "light";
        const resolved = applyThemeToDocument(next);
        set({ theme: next, resolvedTheme: resolved });
      },
    }),
    {
      name: "okuulib_theme_v1",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.resolvedTheme = applyThemeToDocument(state.theme);
        }
      },
    }
  )
);
