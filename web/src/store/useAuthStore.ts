import { create } from "zustand";
import { JWTResponse, UserDTO } from "../types";
import { authStorage } from "../lib/auth";

interface AuthState {
  user: UserDTO | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (tokens: JWTResponse, user?: UserDTO) => void;
  logout: () => void;
  setUser: (user: UserDTO) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrated: false,

  login: (tokens: JWTResponse, user?: UserDTO) => {
    authStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    set({
      accessToken: tokens.accessToken,
      isAuthenticated: true,
      user: user || null,
      isHydrated: true,
    });
  },

  logout: () => {
    authStorage.clearTokens();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrated: true,
    });
  },

  setUser: (user: UserDTO) => set({ user }),

  hydrate: () => {
    const token = authStorage.getAccessToken();
    set({
      accessToken: token,
      isAuthenticated: !!token,
      isHydrated: true,
    });
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("okuulib:logout", () => {
    useAuthStore.getState().logout();
  });
}
