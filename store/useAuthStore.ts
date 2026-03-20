import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { JWTResponse, UserDTO } from '../interfaces/interfaces';
import { secureStorage } from '../lib/secureStorage';
import {
  clearAuthToken,
  clearRefreshToken,
  setAuthToken,
  setRefreshToken,
} from '../lib/tokenStorage';

export interface AuthState {
  accessToken: string | null;
  tokenType: string | null;
  user: UserDTO | null;
  isHydrated: boolean;

  // Actions
  login: (jwt: JWTResponse, user?: UserDTO) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserDTO) => void;
  markHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      tokenType: null,
      user: null,
      isHydrated: false,

      login: async (jwt: JWTResponse, user?: UserDTO) => {
        try {
          await setAuthToken(jwt.accessToken);
          if (jwt.refreshToken) {
            await setRefreshToken(jwt.refreshToken);
          }
          set({
            accessToken: jwt.accessToken,
            tokenType: jwt.tokenType,
            user: user ?? null,
          });
        } catch (error) {
          if (__DEV__) console.error('[AuthStore] login error:', error);
          throw error;
        }
      },

      logout: async () => {
        try {
          await Promise.all([clearAuthToken(), clearRefreshToken()]);
        } catch (error) {
          if (__DEV__) console.error('[AuthStore] logout cleanup error:', error);
        } finally {
          set({ accessToken: null, tokenType: null, user: null });
        }
      },

      setUser: (user: UserDTO) => set({ user }),

      markHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'okuulib-auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        tokenType: state.tokenType,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        state.markHydrated();

        if (state.accessToken) {
          setAuthToken(state.accessToken).catch((err) => { if (__DEV__) console.warn('[AuthStore] token sync on rehydrate failed:', err); }
          );
        }
      },
    }
  )
);