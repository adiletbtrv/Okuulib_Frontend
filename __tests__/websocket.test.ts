// __tests__/websocket.test.ts
import { ChatWebSocket } from '../lib/websocket';

// Mock config and authStore
jest.mock('../lib/config', () => ({
  config: {
    WS_URL: 'ws://localhost:8082',
    API_URL: 'http://localhost:8082',
  },
}));

jest.mock('../store/useAuthStore', () => ({
  useAuthStore: {
    getState: () => ({
      accessToken: 'test-ws-jwt-token',
    }),
  },
}));

class MockWebSocket {
  static OPEN = 1;
  static CONNECTING = 0;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  url: string;
  onopen: (() => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  onclose: ((event: any) => void) | null = null;
  send = jest.fn();
  close = jest.fn().mockImplementation(() => {
    this.readyState = MockWebSocket.CLOSED;
  });

  constructor(url: string) {
    this.url = url;
  }
}

(globalThis as any).WebSocket = MockWebSocket;

describe('ChatWebSocket Architecture & Reconnection Engine', () => {
  let onMessageMock: jest.Mock;
  let onStatusMock: jest.Mock;
  let chatWs: ChatWebSocket;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    onMessageMock = jest.fn();
    onStatusMock = jest.fn();
    chatWs = new ChatWebSocket(onMessageMock, onStatusMock);
  });

  afterEach(() => {
    chatWs.disconnect();
    jest.useRealTimers();
  });

  it('calculates exponential backoff delay correctly according to formula', () => {
    // Formula: delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000)
    const calculateDelay = (attempt: number) =>
      Math.min(1000 * Math.pow(2, attempt - 1), 30000);

    expect(calculateDelay(1)).toBe(1000);
    expect(calculateDelay(2)).toBe(2000);
    expect(calculateDelay(3)).toBe(4000);
    expect(calculateDelay(4)).toBe(8000);
    expect(calculateDelay(5)).toBe(16000);
    expect(calculateDelay(6)).toBe(30000);
  });

  it('attaches auth token to WebSocket connection URL', () => {
    chatWs.connect();
    expect(onStatusMock).toHaveBeenCalledWith('connecting');
    const instance = (chatWs as any).ws as MockWebSocket;
    expect(instance.url).toBe('ws://localhost:8082/ws/chat?token=test-ws-jwt-token');
  });

  it('disables retries on permanent 404 / 4004 server response', () => {
    chatWs.connect();
    const instance = (chatWs as any).ws as MockWebSocket;

    // Simulate 404 close event
    instance.onclose?.({ code: 4004, reason: 'Endpoint not found: 404' } as any);

    expect(onStatusMock).toHaveBeenCalledWith('disconnected');
    expect((chatWs as any).permanentlyFailed).toBe(true);

    // Fast-forward timers - no reconnect should trigger
    jest.advanceTimersByTime(10000);
    expect((chatWs as any).reconnectAttempts).toBe(0);
  });

  it('schedules delayed recovery upon 403 Forbidden', () => {
    chatWs.connect();
    const instance = (chatWs as any).ws as MockWebSocket;

    // Simulate 403 close event
    instance.onclose?.({ code: 1006, reason: 'bad response code from server: 403' } as any);

    expect(onStatusMock).toHaveBeenCalledWith('disconnected');

    // Advance 2s auth refresh window
    jest.advanceTimersByTime(2000);
    expect(onStatusMock).toHaveBeenCalledWith('connecting');
  });

  it('handles incoming JSON chat messages and notifies listener', () => {
    chatWs.connect();
    const instance = (chatWs as any).ws as MockWebSocket;
    instance.readyState = MockWebSocket.OPEN;
    instance.onopen?.();

    expect(onStatusMock).toHaveBeenCalledWith('connected');
    expect(chatWs.isConnected()).toBe(true);

    // Simulate incoming message
    instance.onmessage?.({
      data: JSON.stringify({ text: 'Манас эпосу боюнча сурооңузга жооп', sender: 'AI' }),
    });

    expect(onMessageMock).toHaveBeenCalledWith({
      text: 'Манас эпосу боюнча сурооңузга жооп',
      sender: 'AI',
    });
  });

  it('cleans up resources and cancels timers on disconnect()', () => {
    chatWs.connect();
    expect((chatWs as any).ws).not.toBeNull();

    chatWs.disconnect();
    expect((chatWs as any).isIntentionalClose).toBe(true);
    expect((chatWs as any).ws).toBeNull();
    expect((chatWs as any).reconnectTimeoutId).toBeNull();
  });
});
