export interface ReaderThemeConfig {
  name: string;
  label: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
}

export const READER_THEMES: Record<string, ReaderThemeConfig> = {
  light: {
    name: "light",
    label: "Жарык",
    bg: "#FAFAFA",
    surface: "#FFFFFF",
    text: "#1A1A2E",
    muted: "#6B7280",
    border: "#E5E7EB",
    accent: "#E84326",
  },
  sepia: {
    name: "sepia",
    label: "Сепия",
    bg: "#FBF0D9",
    surface: "#F3E5C8",
    text: "#433422",
    muted: "#8C7355",
    border: "#EAD7B2",
    accent: "#C46D28",
  },
  dark: {
    name: "dark",
    label: "Караңгы",
    bg: "#111620",
    surface: "#1A202C",
    text: "#E2E8F0",
    muted: "#94A3B8",
    border: "#2D3748",
    accent: "#FF5C3A",
  },
  oled: {
    name: "oled",
    label: "OLED",
    bg: "#000000",
    surface: "#121212",
    text: "#FFFFFF",
    muted: "#71717A",
    border: "#27272A",
    accent: "#E84326",
  },
};
