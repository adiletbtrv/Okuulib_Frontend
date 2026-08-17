import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAFA",
        surface: "#FFFFFF",
        "surface-high": "#F3F4F6",
        border: "#E5E7EB",
        accent: {
          DEFAULT: "#E84326",
          light: "#FF5C3A",
          dark: "#D63A20",
          tint: "rgba(232, 67, 38, 0.08)",
        },
        brand: {
          50: "#FFF5F4",
          100: "#FFE8E5",
          200: "#FFD1CB",
          300: "#FFA79B",
          400: "#FF5C3A",
          500: "#E84326",
          600: "#D63A20",
          700: "#B52B14",
          800: "#8E210F",
          900: "#6B170A",
        },
        text: {
          primary: "#1A1A2E",
          secondary: "#6B7280",
          muted: "#9CA3AF",
          onAccent: "#FFFFFF",
        },
        reader: {
          light: {
            bg: "#FAFAFA",
            surface: "#FFFFFF",
            text: "#1A1A2E",
            muted: "#6B7280",
            border: "#E5E7EB",
            accent: "#E84326",
          },
          sepia: {
            bg: "#FBF0D9",
            surface: "#F3E5C8",
            text: "#433422",
            muted: "#8C7355",
            border: "#EAD7B2",
            accent: "#C46D28",
          },
          dark: {
            bg: "#111620",
            surface: "#1A202C",
            text: "#E2E8F0",
            muted: "#94A3B8",
            border: "#2D3748",
            accent: "#FF5C3A",
          },
          oled: {
            bg: "#000000",
            surface: "#121212",
            text: "#FFFFFF",
            muted: "#71717A",
            border: "#27272A",
            accent: "#E84326",
          },
        },
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "14px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        full: "9999px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(0, 0, 0, 0.04)",
        sm: "0 1px 3px rgba(0, 0, 0, 0.05)",
        md: "0 4px 12px rgba(0, 0, 0, 0.08)",
        lg: "0 8px 24px rgba(0, 0, 0, 0.12)",
        xl: "0 16px 36px rgba(0, 0, 0, 0.15)",
        brand: "0 8px 24px rgba(232, 67, 38, 0.25)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        serif: ["var(--font-merriweather)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [typography],
};

export default config;
