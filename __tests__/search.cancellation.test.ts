// __tests__/search.cancellation.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useSearchBooks } from '../hooks/useSearchBooks';
import { worksApi } from '../lib/api';

jest.mock('../lib/api', () => ({
  worksApi: {
    search: jest.fn(),
  },
}));

describe('useSearchBooks AbortController & Cancellation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cancels previous in-flight request when a new search query is initiated', async () => {
    let firstRequestSignal: AbortSignal | undefined;
    let secondRequestSignal: AbortSignal | undefined;

    (worksApi.search as jest.Mock)
      .mockImplementationOnce((_params, options) => {
        firstRequestSignal = options?.signal;
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ content: [{ id: 1, title: 'Old Result' }] });
          }, 100);
        });
      })
      .mockImplementationOnce((_params, options) => {
        secondRequestSignal = options?.signal;
        return Promise.resolve({ content: [{ id: 2, title: 'New Result' }] });
      });

    const { result } = renderHook(() => useSearchBooks());

    // Trigger first search
    act(() => {
      result.current.search('Ма');
    });

    // Immediately trigger second search before first finishes
    await act(async () => {
      await result.current.search('Манас');
    });

    // First request should have been aborted
    expect(firstRequestSignal?.aborted).toBe(true);
    expect(secondRequestSignal?.aborted).toBe(false);

    // Items should strictly contain the latest result
    expect(result.current.items).toEqual([{ id: 2, title: 'New Result' }]);
  });

  it('clears items and aborts active request when clear() is invoked', async () => {
    let requestSignal: AbortSignal | undefined;

    (worksApi.search as jest.Mock).mockImplementation((_params, options) => {
      requestSignal = options?.signal;
      return new Promise(() => {}); // never resolves
    });

    const { result } = renderHook(() => useSearchBooks());

    act(() => {
      result.current.search('Кыргыз');
    });

    expect(result.current.loading).toBe(true);
    expect(requestSignal?.aborted).toBe(false);

    act(() => {
      result.current.clear();
    });

    expect(requestSignal?.aborted).toBe(true);
    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('aborts active request on component unmount', () => {
    let requestSignal: AbortSignal | undefined;

    (worksApi.search as jest.Mock).mockImplementation((_params, options) => {
      requestSignal = options?.signal;
      return new Promise(() => {});
    });

    const { result, unmount } = renderHook(() => useSearchBooks());

    act(() => {
      result.current.search('Чыңгыз Айтматов');
    });

    expect(requestSignal?.aborted).toBe(false);

    unmount();

    expect(requestSignal?.aborted).toBe(true);
  });
});
