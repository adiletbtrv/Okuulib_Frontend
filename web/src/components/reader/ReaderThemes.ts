import { ReaderThemeMode } from "../../store/useReaderStore";

export interface ThemeConfig {
  name: string;
  label: string;
  bg: string;
  text: string;
  surface: string;
  border: string;
  muted: string;
  accent: string;
}

export const READER_THEMES: Record<ReaderThemeMode, ThemeConfig> = {
  light: {
    name: "light",
    label: "Ак (Light)",
    bg: "#FAFAFA",
    text: "#18181B",
    surface: "#FFFFFF",
    border: "#E4E4E7",
    muted: "#71717A",
    accent: "#E8341A",
  },
  sepia: {
    name: "sepia",
    label: "Пергамент (Sepia)",
    bg: "#FBF0D9",
    text: "#433422",
    surface: "#F4E5C4",
    border: "#E2CFAB",
    muted: "#7C6346",
    accent: "#B8200A",
  },
  dark: {
    name: "dark",
    label: "Түнкү (Slate)",
    bg: "#111620",
    text: "#E2E8F0",
    surface: "#1A212E",
    border: "#2A3446",
    muted: "#94A3B8",
    accent: "#E8341A",
  },
  oled: {
    name: "oled",
    label: "OLED Кара (Black)",
    bg: "#000000",
    text: "#D4D4D8",
    surface: "#0A0A0A",
    border: "#202020",
    muted: "#71717A",
    accent: "#E8341A",
  },
};
