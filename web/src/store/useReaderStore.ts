import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ReaderThemeMode = "light" | "sepia" | "dark" | "oled";
export type ReaderFontFamily = "sans" | "serif" | "mono";
export type ReaderMaxWidth = "max-w-2xl" | "max-w-3xl" | "max-w-4xl" | "max-w-5xl";

export interface BookProgress {
  chapterIdx: number;
  scrollPercent: number;
  updatedAt: string;
}

interface ReaderState {
  theme: ReaderThemeMode;
  fontFamily: ReaderFontFamily;
  fontSize: number;
  lineHeight: number;
  maxWidth: ReaderMaxWidth;
  showControls: boolean;
  readingProgress: Record<number, BookProgress>;

  setTheme: (theme: ReaderThemeMode) => void;
  setFontFamily: (fontFamily: ReaderFontFamily) => void;
  setFontSize: (fontSize: number) => void;
  setLineHeight: (lineHeight: number) => void;
  setMaxWidth: (maxWidth: ReaderMaxWidth) => void;
  toggleControls: () => void;
  setShowControls: (show: boolean) => void;
  saveProgress: (workId: number, chapterIdx: number, scrollPercent: number) => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      theme: "dark",
      fontFamily: "serif",
      fontSize: 18,
      lineHeight: 1.75,
      maxWidth: "max-w-3xl",
      showControls: true,
      readingProgress: {},

      setTheme: (theme) => set({ theme }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFontSize: (fontSize) => set({ fontSize: Math.max(14, Math.min(28, fontSize)) }),
      setLineHeight: (lineHeight) => set({ lineHeight: Math.max(1.4, Math.min(2.4, lineHeight)) }),
      setMaxWidth: (maxWidth) => set({ maxWidth }),
      toggleControls: () => set((state) => ({ showControls: !state.showControls })),
      setShowControls: (showControls) => set({ showControls }),

      saveProgress: (workId, chapterIdx, scrollPercent) =>
        set((state) => ({
          readingProgress: {
            ...state.readingProgress,
            [workId]: {
              chapterIdx,
              scrollPercent: Math.round(scrollPercent),
              updatedAt: new Date().toISOString(),
            },
          },
        })),
    }),
    {
      name: "okuulib_reader_prefs_v1",
    }
  )
);
