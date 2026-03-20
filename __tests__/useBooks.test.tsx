import { renderHook, waitFor } from '@testing-library/react-native';
import { useBooks } from '../hooks/useAppQuery';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { worksApi } from '../lib/api';

jest.mock('../lib/api', () => ({
  worksApi: {
    getAll: jest.fn()
  }
}));

jest.mock('../store/useAuthStore');

const createTestQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

describe('useBooks Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches books when hydrated', async () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue(true);
    (worksApi.getAll as jest.Mock).mockResolvedValue({ content: [{ id: 10, title: 'Mocked Book' }] });

    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useBooks(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 10, title: 'Mocked Book' }]);
  });

  it('stays idle when not hydrated', () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue(false);
    
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useBooks(), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
  });
});
