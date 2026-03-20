import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { config } from './config';
import { clearAuthToken, clearRefreshToken, setAuthToken } from './tokenStorage';

import type {
  AllWorksDTO,
  AuthorFullResponse,
  AuthorResponse,
  BookmarkResponse,
  ChangePasswordRequest,
  ChatSessionDTO,
  ChatSessionWithMessages,
  CreateBookmarkRequest,
  CreateChatSessionRequest,
  CreateGenreRequest,
  GenreDTO,
  GoogleLoginRequest,
  JWTResponse,
  LoginDTO,
  PaginatedResponse,
  PaginationParams,
  ProfilePhotoUploadResponse,
  RegisterRequest,
  RegisterResponse,
  UserDTO,
  WorkResponse,
  WorkSearchParams,
} from '../interfaces/interfaces';

const api = axios.create({
  baseURL: config.API_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Refresh-queue machinery
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.request.use(
  async (reqConfig: InternalAxiosRequestConfig) => {
    try {
      const token = useAuthStore.getState()?.accessToken;
      if (token && reqConfig.headers) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      if (__DEV__) console.warn('[API] Could not read token from store:', err);
    }
    return reqConfig;
  },
  (error) => {
    if (__DEV__) console.error('[API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      const url = original.url ?? '';
      const isAuthEndpoint =
        url.includes('/auth/refresh-token') ||
        url.includes('/auth/login') ||
        url.includes('/auth/register');

      if (isAuthEndpoint) return Promise.reject(error);

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (original.headers) original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post<JWTResponse>('/api/auth/refresh-token');
        const newToken = data.accessToken;

        await setAuthToken(newToken);
        const store = useAuthStore.getState();
        await store.login(data, store.user ?? undefined);

        processQueue(null, newToken);

        if (original.headers) original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        try {
          await Promise.all([
            clearAuthToken(),
            clearRefreshToken(),
          ]);
          await useAuthStore.getState().logout();
        } catch (logoutErr) {
          if (__DEV__) console.error('[API] logout after refresh failure:', logoutErr);
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    if (!error.response) {
      console.error('[API] Network error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    if (error.response.status >= 500) {
      console.error(`[API] Server error (${error.response.status})`);
      return Promise.reject(new Error('Server error. Please try again later.'));
    }

    return Promise.reject(error);
  }
);

export {
  clearAuthToken,
  clearRefreshToken,
  getAuthToken,
  setAuthToken,
  setRefreshToken
} from './tokenStorage';

export const authApi = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const { data: res } = await api.post<RegisterResponse>('/api/auth/register', data);
    return res;
  },

  login: async (data: LoginDTO): Promise<JWTResponse> => {
    const { data: jwt } = await api.post<JWTResponse>('/api/auth/login', data);
    return jwt;
  },

  googleLogin: async (data: GoogleLoginRequest): Promise<JWTResponse> => {
    const { data: jwt } = await api.post<JWTResponse>('/api/auth/google-login', data);
    return jwt;
  },

  refreshToken: async (): Promise<JWTResponse> => {
    const { data: jwt } = await api.post<JWTResponse>('/api/auth/refresh-token');
    return jwt;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.post('/api/auth/change-password', data);
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      if (__DEV__) console.warn('[AuthApi] Server logout failed (continuing locally):', err);
    }
  },

  me: async (): Promise<UserDTO> => {
    const { data } = await api.get<UserDTO>('/api/auth/me');
    return data;
  },

  uploadProfilePhoto: async (formData: FormData): Promise<ProfilePhotoUploadResponse> => {
    const { data } = await api.post<string | ProfilePhotoUploadResponse>(
      '/api/auth/profile-photo',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    if (typeof data === 'string') return { url: data };
    return data as ProfilePhotoUploadResponse;
  },

  deleteProfilePhoto: async (): Promise<void> => {
    await api.delete('/api/auth/profile-photo');
  },
};

export const worksApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<AllWorksDTO>> => {
    const { data } = await api.get<PaginatedResponse<AllWorksDTO>>('/api/works', { params });
    return data;
  },

  getById: async (id: number): Promise<WorkResponse> => {
    const { data } = await api.get<WorkResponse>(`/api/works/${id}`);
    return data;
  },

  search: async (params: WorkSearchParams): Promise<PaginatedResponse<AllWorksDTO>> => {
    const { data } = await api.get<AllWorksDTO[] | PaginatedResponse<AllWorksDTO>>(
      '/api/works/search',
      { params }
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

  upload: async (formData: FormData): Promise<{ id: number }> => {
    const { data } = await api.post<number>('/api/works/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { id: data as unknown as number };
  },
};

export const authorsApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<AuthorResponse>> => {
    const { data } = await api.get<PaginatedResponse<AuthorResponse>>('/api/authors', { params });
    return data;
  },

  getById: async (id: number): Promise<AuthorFullResponse> => {
    const { data } = await api.get<AuthorFullResponse>(`/api/authors/${id}`);
    return data;
  },

  create: async (formData: FormData): Promise<AuthorResponse> => {
    const { data } = await api.post<AuthorResponse>('/api/authors', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

export const genresApi = {
  getAll: async (): Promise<GenreDTO[]> => {
    const { data } = await api.get<GenreDTO[]>('/api/genres');
    return data;
  },

  getById: async (id: number): Promise<GenreDTO> => {
    const { data } = await api.get<GenreDTO>(`/api/genres/${id}`);
    return data;
  },

  create: async (body: CreateGenreRequest): Promise<GenreDTO> => {
    const { data } = await api.post<GenreDTO>('/api/genres', body);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/genres/${id}`);
  },
};

export const bookmarksApi = {
  create: async (body: CreateBookmarkRequest): Promise<BookmarkResponse> => {
    const { data } = await api.post<BookmarkResponse>('/api/bookmarks', body);
    return data;
  },

  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<BookmarkResponse>> => {
    const { data } = await api.get<PaginatedResponse<BookmarkResponse>>('/api/bookmarks', { params });
    return data;
  },

  getById: async (id: number): Promise<BookmarkResponse> => {
    const { data } = await api.get<BookmarkResponse>(`/api/bookmarks/${id}`);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/bookmarks/${id}`);
  },

  clearAll: async (): Promise<void> => {
    await api.delete('/api/bookmarks');
  },
};

export const chatSessionsApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<ChatSessionDTO>> => {
    const { data } = await api.get<PaginatedResponse<ChatSessionDTO>>('/api/chat-sessions', {
      params,
    });
    return data;
  },

  getById: async (id: number): Promise<ChatSessionWithMessages> => {
    const { data } = await api.get<ChatSessionWithMessages>(`/api/chat-sessions/${id}`);
    return data;
  },

  create: async (body: CreateChatSessionRequest): Promise<ChatSessionDTO> => {
    const { data } = await api.post<ChatSessionDTO>('/api/chat-sessions', body);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/chat-sessions/${id}`);
  },
};

export function getApiErrorMessage(err: unknown, fallback = 'Ката кетти. Кийинчерээк аракет кылыңыз.'): string {
  if (!err) return fallback;

  const axiosErr = err as { response?: { status?: number; data?: { message?: string; error?: string } }; message?: string };

  const status = axiosErr.response?.status;
  const serverMsg = axiosErr.response?.data?.message ?? axiosErr.response?.data?.error;

  switch (status) {
    case 409: return 'Бул колдонуучу аты же email буга чейин катталган.';
    case 401: return 'Логин же сырсөз туура эмес.';
    case 403: return 'Кирүүгө уруксат жок.';
    case 404: return 'Суралган ресурс табылган жок.';
    case 422: return serverMsg ?? 'Маалыматтар туура эмес. Текшерип кайра жибериңиз.';
    case 429: return 'Өтө көп суроо-талап. Бир аз күтүп, кайра аракет кылыңыз.';
  }
  if (serverMsg) return serverMsg;
  if (axiosErr.message) return axiosErr.message;
  return fallback;
}


export const searchBooks = async (query: string): Promise<AllWorksDTO[]> => {
  const result = await worksApi.search({ q: query });
  return result.content;
};

export type Result<T> = { data: T; error: null } | { data: null; error: string };

export async function safeApi<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (err: unknown) {
    return { data: null, error: getApiErrorMessage(err) };
  }
}

export type {
  ChatMessage,
  ChatSessionDTO,
  ChatSessionWithMessages,
  UserDTO
} from '../interfaces/interfaces';

export default api;