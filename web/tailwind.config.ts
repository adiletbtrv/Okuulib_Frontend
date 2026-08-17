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
        brand: {
          50: "#FFF5F4",
          100: "#FFE8E5",
          500: "#E8341A",
          600: "#D32910",
          700: "#B8200A",
        },
        reader: {
          light: {
            bg: "#FAFAFA",
            surface: "#FFFFFF",
            text: "#27272A",
            muted: "#71717A",
            border: "#E4E4E7",
          },
          sepia: {
            bg: "#FBF0D9",
            surface: "#F4E5C4",
            text: "#5F4B32",
            muted: "#8C7355",
            border: "#EAD7B2",
          },
          dark: {
            bg: "#13171F",
            surface: "#1E2430",
            text: "#E2E8F0",
            muted: "#94A3B8",
            border: "#2D3748",
          },
          oled: {
            bg: "#000000",
            surface: "#0F0F0F",
            text: "#D4D4D8",
            muted: "#71717A",
            border: "#27272A",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-merriweather)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [typography],
};

export default config;
