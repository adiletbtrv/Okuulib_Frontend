// __tests__/api.interceptors.test.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Mock tokenStorage
const mockGetRefreshToken = jest.fn();
const mockSetAuthToken = jest.fn();
const mockClearAuthToken = jest.fn();
const mockClearRefreshToken = jest.fn();

jest.mock('../lib/tokenStorage', () => ({
  getAuthToken: jest.fn().mockResolvedValue('mock-access-token'),
  getRefreshToken: (...args: any[]) => mockGetRefreshToken(...args),
  setAuthToken: (...args: any[]) => mockSetAuthToken(...args),
  setRefreshToken: jest.fn(),
  clearAuthToken: (...args: any[]) => mockClearAuthToken(...args),
  clearRefreshToken: (...args: any[]) => mockClearRefreshToken(...args),
}));

// Mock useAuthStore
const mockLogin = jest.fn();
const mockLogout = jest.fn();

jest.mock('../store/useAuthStore', () => ({
  useAuthStore: {
    getState: () => ({
      accessToken: 'initial-access-token',
      user: { username: 'testuser' },
      login: mockLogin,
      logout: mockLogout,
    }),
  },
}));

describe('Axios Interceptors & Refresh Queue Mutex', () => {
  let requestInterceptor: (config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig>;
  let responseErrorInterceptor: (error: AxiosError) => Promise<any>;
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRefreshToken.mockResolvedValue('valid-refresh-token');

    // Create a mock Axios instance with handlers
    const requestHandlers: any[] = [];
    const responseHandlers: any[] = [];

    mockAxiosInstance = jest.fn((config) => Promise.resolve({ data: 'success', config }));
    mockAxiosInstance.interceptors = {
      request: {
        use: jest.fn((fn) => {
          requestInterceptor = fn;
          requestHandlers.push(fn);
        }),
      },
      response: {
        use: jest.fn((successFn, errorFn) => {
          responseErrorInterceptor = errorFn;
          responseHandlers.push({ successFn, errorFn });
        }),
      },
    };
    mockAxiosInstance.post = jest.fn();
    mockAxiosInstance.get = jest.fn();
  });

  it('handles 5 concurrent 401 requests with a single refresh call and replays all 5', async () => {
    let isRefreshing = false;
    let failedQueue: Array<{
      resolve: (token: string) => void;
      reject: (error: unknown) => void;
    }> = [];

    const processQueue = (error: unknown, token: string | null = null) => {
      failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
      failedQueue = [];
    };

    const mockRefreshTokenApi = jest.fn().mockImplementation(async () => {
      return { data: { accessToken: 'new-refreshed-token', tokenType: 'Bearer' } };
    });

    const handle401Error = async (originalRequest: any) => {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return mockAxiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await mockGetRefreshToken();
        const { data } = await mockRefreshTokenApi(refreshToken);
        const newToken = data.accessToken;

        await mockSetAuthToken(newToken);
        await mockLogin(data);

        processQueue(null, newToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return mockAxiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await mockClearAuthToken();
        await mockClearRefreshToken();
        await mockLogout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    };

    // Simulate 5 simultaneous requests getting 401
    const requests = [
      { url: '/api/works/1', headers: {} },
      { url: '/api/works/2', headers: {} },
      { url: '/api/works/3', headers: {} },
      { url: '/api/bookmarks', headers: {} },
      { url: '/api/chat-sessions', headers: {} },
    ];

    const results = await Promise.all(requests.map((req) => handle401Error(req)));

    // Assert only 1 refresh call was made despite 5 concurrent 401s
    expect(mockRefreshTokenApi).toHaveBeenCalledTimes(1);
    expect(mockRefreshTokenApi).toHaveBeenCalledWith('valid-refresh-token');
    expect(mockSetAuthToken).toHaveBeenCalledWith('new-refreshed-token');
    expect(mockLogin).toHaveBeenCalled();

    // Assert all 5 requests were replayed and resolved
    expect(results.length).toBe(5);
    results.forEach((res) => {
      expect(res.data).toBe('success');
      expect(res.config.headers.Authorization).toBe('Bearer new-refreshed-token');
    });
  });

  it('rejects the entire failedQueue and logs out when token refresh fails', async () => {
    let isRefreshing = false;
    let failedQueue: Array<{
      resolve: (token: string) => void;
      reject: (error: unknown) => void;
    }> = [];

    const processQueue = (error: unknown, token: string | null = null) => {
      failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
      failedQueue = [];
    };

    const mockFailingRefreshTokenApi = jest.fn().mockRejectedValue(new Error('Invalid refresh token'));

    const handle401Error = async (originalRequest: any) => {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return mockAxiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await mockGetRefreshToken();
        const { data } = await mockFailingRefreshTokenApi(refreshToken);
        const newToken = data.accessToken;
        processQueue(null, newToken);
        return mockAxiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await mockClearAuthToken();
        await mockClearRefreshToken();
        await mockLogout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    };

    const req1 = handle401Error({ url: '/api/works/1' });
    const req2 = handle401Error({ url: '/api/works/2' });
    const req3 = handle401Error({ url: '/api/bookmarks' });

    await expect(Promise.all([req1, req2, req3])).rejects.toThrow('Invalid refresh token');

    // Assert cleanup & logout
    expect(mockClearAuthToken).toHaveBeenCalled();
    expect(mockClearRefreshToken).toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
  });
});
