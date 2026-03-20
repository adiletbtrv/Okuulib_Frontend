import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ReaderTheme = 'dark' | 'light';

interface ReaderThemeStore {
    theme: ReaderTheme;
    setTheme: (theme: ReaderTheme) => void;
    toggleTheme: () => void;
}

export const useReaderThemeStore = create<ReaderThemeStore>()(
    persist(
        (set) => ({
            theme: 'dark',
            setTheme: (theme) => set({ theme }),
            toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
        }),
        {
            name: 'okuulib-reader-theme',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
