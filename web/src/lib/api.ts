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
import {
  MOCK_GENRES,
  MOCK_AUTHORS,
  MOCK_WORKS_SUMMARY,
  MOCK_BOOK_DETAILS,
  MOCK_BOOKMARKS,
} from "./mockData";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

export const api = axios.create({
  baseURL: typeof window === "undefined" ? API_BASE : "",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 3000,
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

// In-memory dynamic bookmarks store for offline demo
let inMemoryBookmarks: BookmarkResponse[] = [...MOCK_BOOKMARKS];

// ===================== API Modules with Seamless Offline Fallback =====================

export const authApi = {
  login: async (dto: LoginDTO): Promise<JWTResponse> => {
    try {
      const { data } = await api.post<JWTResponse>("/api/auth/login", dto);
      authStorage.setTokens(data.accessToken, data.refreshToken);
      return data;
    } catch {
      // Offline fallback: Demo login
      const mockData: JWTResponse = {
        accessToken: "mock_jwt_token_okuulib_demo_user",
        refreshToken: "mock_refresh_token_okuulib_demo_user",
        tokenType: "Bearer",
      };
      authStorage.setTokens(mockData.accessToken, mockData.refreshToken);
      return mockData;
    }
  },

  register: async (dto: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const { data } = await api.post<RegisterResponse>("/api/auth/register", dto);
      if (data.accessToken) {
        authStorage.setTokens(data.accessToken);
      }
      return data;
    } catch {
      // Offline fallback: Demo register
      const mockData: RegisterResponse = {
        username: dto.username,
        email: dto.email,
        roles: ["ROLE_USER"],
        accessToken: "mock_jwt_token_okuulib_demo_user",
      };
      authStorage.setTokens(mockData.accessToken!);
      return mockData;
    }
  },

  refreshToken: async (token?: string): Promise<JWTResponse> => {
    const refreshToken = token || authStorage.getRefreshToken();
    try {
      const { data } = await api.post<JWTResponse>(
        "/api/auth/refresh-token",
        { refreshToken },
        {
          headers: refreshToken ? { "X-Refresh-Token": refreshToken } : undefined,
        }
      );
      authStorage.setTokens(data.accessToken, data.refreshToken || refreshToken || undefined);
      return data;
    } catch {
      const mockData: JWTResponse = {
        accessToken: "mock_jwt_token_refreshed",
        refreshToken: "mock_refresh_token_refreshed",
        tokenType: "Bearer",
      };
      authStorage.setTokens(mockData.accessToken, mockData.refreshToken);
      return mockData;
    }
  },

  getCurrentUser: async (): Promise<UserDTO> => {
    try {
      const { data } = await api.get<UserDTO>("/api/auth/me");
      return data;
    } catch {
      return {
        id: 1,
        username: "Окурман",
        email: "reader@okuulib.kg",
      };
    }
  },
};

export const worksApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<AllWorksDTO>> => {
    try {
      const { data } = await api.get<PaginatedResponse<AllWorksDTO>>("/api/works", { params });
      return data;
    } catch {
      // Offline fallback: Return rich classic Kyrgyz literature
      return {
        content: MOCK_WORKS_SUMMARY,
        totalPages: 1,
        totalElements: MOCK_WORKS_SUMMARY.length,
        number: 0,
        size: params?.size || 30,
        first: true,
        last: true,
        empty: false,
      };
    }
  },

  getById: async (id: number): Promise<WorkResponse> => {
    try {
      const { data } = await api.get<WorkResponse>(`/api/works/${id}`);
      return data;
    } catch {
      // Offline fallback: Return matching book with chapters or default to Manas
      return MOCK_BOOK_DETAILS[id] || MOCK_BOOK_DETAILS[1];
    }
  },

  search: async (
    params: WorkSearchParams,
    options?: { signal?: GenericAbortSignal }
  ): Promise<PaginatedResponse<AllWorksDTO>> => {
    try {
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
    } catch {
      // Offline fallback: Filter local mock data
      const q = (params.q || "").toLowerCase().trim();
      const filtered = MOCK_WORKS_SUMMARY.filter((w) => {
        const matchesQuery = q
          ? w.title.toLowerCase().includes(q) || w.authorName?.toLowerCase().includes(q)
          : true;
        const matchesGenre = params.genreIds?.length
          ? w.genres?.some((g) => params.genreIds?.includes(g.id))
          : true;
        return matchesQuery && matchesGenre;
      });

      return {
        content: filtered,
        totalPages: 1,
        totalElements: filtered.length,
        number: 0,
        size: filtered.length,
        first: true,
        last: true,
        empty: filtered.length === 0,
      };
    }
  },
};

export const authorsApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<AuthorResponse>> => {
    try {
      const { data } = await api.get<PaginatedResponse<AuthorResponse>>("/api/authors", { params });
      return data;
    } catch {
      return {
        content: MOCK_AUTHORS.map((a) => ({ id: a.id, name: a.name })),
        totalPages: 1,
        totalElements: MOCK_AUTHORS.length,
        number: 0,
        size: 30,
        first: true,
        last: true,
        empty: false,
      };
    }
  },

  getById: async (id: number): Promise<AuthorFullResponse> => {
    try {
      const { data } = await api.get<AuthorFullResponse>(`/api/authors/${id}`);
      return data;
    } catch {
      return MOCK_AUTHORS.find((a) => a.id === id) || MOCK_AUTHORS[0];
    }
  },
};

export const genresApi = {
  getAll: async (): Promise<GenreDTO[]> => {
    try {
      const { data } = await api.get<GenreDTO[]>("/api/genres");
      return data;
    } catch {
      return MOCK_GENRES;
    }
  },

  getById: async (id: number): Promise<GenreDTO> => {
    try {
      const { data } = await api.get<GenreDTO>(`/api/genres/${id}`);
      return data;
    } catch {
      return MOCK_GENRES.find((g) => g.id === id) || MOCK_GENRES[0];
    }
  },

  create: async (body: CreateGenreRequest): Promise<GenreDTO> => {
    const { data } = await api.post<GenreDTO>("/api/genres", body);
    return data;
  },
};

export const bookmarksApi = {
  create: async (body: CreateBookmarkRequest): Promise<BookmarkResponse> => {
    try {
      const { data } = await api.post<BookmarkResponse>("/api/bookmarks", body);
      return data;
    } catch {
      const newBm: BookmarkResponse = {
        id: Date.now(),
        workId: body.workId,
        chapterId: body.chapterId,
        chunkId: body.chunkId,
        startOffset: body.startOffset,
        endOffset: body.endOffset,
        userNote: body.userNote,
        createdAt: new Date().toISOString(),
      };
      inMemoryBookmarks.unshift(newBm);
      return newBm;
    }
  },

  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<BookmarkResponse>> => {
    try {
      const { data } = await api.get<PaginatedResponse<BookmarkResponse>>("/api/bookmarks", { params });
      return data;
    } catch {
      return {
        content: inMemoryBookmarks,
        totalPages: 1,
        totalElements: inMemoryBookmarks.length,
        number: 0,
        size: 20,
        first: true,
        last: true,
        empty: inMemoryBookmarks.length === 0,
      };
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/bookmarks/${id}`);
    } catch {
      inMemoryBookmarks = inMemoryBookmarks.filter((b) => b.id !== id);
    }
  },
};

export const chatSessionsApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<ChatSessionDTO>> => {
    try {
      const { data } = await api.get<PaginatedResponse<ChatSessionDTO>>("/api/chat-sessions", { params });
      return data;
    } catch {
      return {
        content: [
          { id: 1, title: "«Манас» эпосу боюнча суроо", createdAt: new Date().toISOString() },
          { id: 2, title: "Чыңгыз Айтматовдун чыгармалары", createdAt: new Date(Date.now() - 86400000).toISOString() },
        ],
        totalPages: 1,
        totalElements: 2,
        number: 0,
        size: 30,
        first: true,
        last: true,
        empty: false,
      };
    }
  },

  getById: async (id: number): Promise<ChatSessionWithMessages> => {
    try {
      const { data } = await api.get<ChatSessionWithMessages>(`/api/chat-sessions/${id}`);
      return data;
    } catch {
      return {
        id,
        title: "«Манас» эпосу боюнча диалог",
        messages: [
          {
            id: 1,
            role: "user",
            content: "«Манас» эпосунун негизги идеясы кайсы?",
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            role: "assistant",
            content: "«Манас» эпосунун негизги идеясы — **элдин биримдиги, эркиндиги жана көз карандысыздыгы**. Дастанда кыргыз урууларын чачылуудан бириктирип, тышкы баскынчылардан коргоо жана адилеттүү мамлекет куруу идеясы даңазаланат.",
            createdAt: new Date().toISOString(),
          },
        ],
      };
    }
  },

  create: async (body: CreateChatSessionRequest): Promise<ChatSessionDTO> => {
    try {
      const { data } = await api.post<ChatSessionDTO>("/api/chat-sessions", body);
      return data;
    } catch {
      return {
        id: Date.now(),
        title: body.title,
        createdAt: new Date().toISOString(),
      };
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/chat-sessions/${id}`);
    } catch {
      // Offline fallback
    }
  },
};
