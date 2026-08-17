import axios, { AxiosError, GenericAbortSignal, InternalAxiosRequestConfig } from "axios";
import {
  AllWorksDTO,
  AuthorFullResponse,
  AuthorResponse,
  BookmarkResponse,
  ChatSessionDTO,
  ChatSessionWithMessages,
  CreateBookmarkRequest,
  CreateChatSessionRequest,
  CreateGenreRequest,
  GenreDTO,
  JWTResponse,
  LoginDTO,
  PaginatedResponse,
  PaginationParams,
  RegisterRequest,
  RegisterResponse,
  UserDTO,
  WorkResponse,
  WorkSearchParams,
} from "../types";
import { authStorage } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

export const api = axios.create({
  baseURL: typeof window === "undefined" ? API_BASE : "",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Mutex queue variables for 401 recovery
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/api/auth/")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = authStorage.getRefreshToken();
        if (!storedRefreshToken) {
          throw new Error("No refresh token available");
        }

        const { data } = await axios.post<JWTResponse>(
          `${API_BASE}/api/auth/refresh-token`,
          { refreshToken: storedRefreshToken },
          {
            headers: {
              "Content-Type": "application/json",
              "X-Refresh-Token": storedRefreshToken,
            },
          }
        );

        const newToken = data.accessToken;
        authStorage.setTokens(newToken, data.refreshToken || storedRefreshToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        authStorage.clearTokens();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("okuulib:logout"));
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ===================== API Modules =====================

export const authApi = {
  login: async (dto: LoginDTO): Promise<JWTResponse> => {
    const { data } = await api.post<JWTResponse>("/api/auth/login", dto);
    authStorage.setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  register: async (dto: RegisterRequest): Promise<RegisterResponse> => {
    const { data } = await api.post<RegisterResponse>("/api/auth/register", dto);
    if (data.accessToken) {
      authStorage.setTokens(data.accessToken);
    }
    return data;
  },

  refreshToken: async (token?: string): Promise<JWTResponse> => {
    const refreshToken = token || authStorage.getRefreshToken();
    const { data } = await api.post<JWTResponse>(
      "/api/auth/refresh-token",
      { refreshToken },
      {
        headers: refreshToken ? { "X-Refresh-Token": refreshToken } : undefined,
      }
    );
    authStorage.setTokens(data.accessToken, data.refreshToken || refreshToken || undefined);
    return data;
  },

  getCurrentUser: async (): Promise<UserDTO> => {
    const { data } = await api.get<UserDTO>("/api/auth/me");
    return data;
  },
};

export const worksApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<AllWorksDTO>> => {
    const { data } = await api.get<PaginatedResponse<AllWorksDTO>>("/api/works", { params });
    return data;
  },

  getById: async (id: number): Promise<WorkResponse> => {
    const { data } = await api.get<WorkResponse>(`/api/works/${id}`);
    return data;
  },

  search: async (
    params: WorkSearchParams,
    options?: { signal?: GenericAbortSignal }
  ): Promise<PaginatedResponse<AllWorksDTO>> => {
    const { data } = await api.get<AllWorksDTO[] | PaginatedResponse<AllWorksDTO>>(
      "/api/works/search",
      { params, signal: options?.signal }
    );
    if (Array.isArray(data)) {
      return {
        content: data,
        totalPages: 1,
        totalElements: data.length,
        number: 0,
        size: data.length,
        first: true,
        last: true,
        empty: data.length === 0,
      };
    }
    return data;
  },
};

export const authorsApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<AuthorResponse>> => {
    const { data } = await api.get<PaginatedResponse<AuthorResponse>>("/api/authors", { params });
    return data;
  },

  getById: async (id: number): Promise<AuthorFullResponse> => {
    const { data } = await api.get<AuthorFullResponse>(`/api/authors/${id}`);
    return data;
  },
};

export const genresApi = {
  getAll: async (): Promise<GenreDTO[]> => {
    const { data } = await api.get<GenreDTO[]>("/api/genres");
    return data;
  },

  getById: async (id: number): Promise<GenreDTO> => {
    const { data } = await api.get<GenreDTO>(`/api/genres/${id}`);
    return data;
  },

  create: async (body: CreateGenreRequest): Promise<GenreDTO> => {
    const { data } = await api.post<GenreDTO>("/api/genres", body);
    return data;
  },
};

export const bookmarksApi = {
  create: async (body: CreateBookmarkRequest): Promise<BookmarkResponse> => {
    const { data } = await api.post<BookmarkResponse>("/api/bookmarks", body);
    return data;
  },

  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<BookmarkResponse>> => {
    const { data } = await api.get<PaginatedResponse<BookmarkResponse>>("/api/bookmarks", { params });
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/bookmarks/${id}`);
  },
};

export const chatSessionsApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<ChatSessionDTO>> => {
    const { data } = await api.get<PaginatedResponse<ChatSessionDTO>>("/api/chat-sessions", { params });
    return data;
  },

  getById: async (id: number): Promise<ChatSessionWithMessages> => {
    const { data } = await api.get<ChatSessionWithMessages>(`/api/chat-sessions/${id}`);
    return data;
  },

  create: async (body: CreateChatSessionRequest): Promise<ChatSessionDTO> => {
    const { data } = await api.post<ChatSessionDTO>("/api/chat-sessions", body);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/chat-sessions/${id}`);
  },
};
