import { WebSocketChatMessage, WebSocketChatResponse } from "../types";
import { authStorage } from "./auth";

type OnMessageCallback = (response: WebSocketChatResponse) => void;
type OnStatusCallback = (
  status: "connecting" | "connected" | "disconnected" | "error"
) => void;

function isPermanentFailure(event: CloseEvent): boolean {
  if (event.code === 4004) return true;
  const reason = (event.reason ?? "").toLowerCase();
  return (
    reason.includes("bad response code from server: 404") ||
    (reason.includes("404") && !reason.includes("403"))
  );
}

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly onMessage: OnMessageCallback;
  private readonly onStatus: OnStatusCallback;
  private isIntentionalClose = false;
  private permanentlyFailed = false;

  constructor(onMessage: OnMessageCallback, onStatus: OnStatusCallback) {
    this.onMessage = onMessage;
    this.onStatus = onStatus;
  }

  private getWsUrl(): string {
    const token = authStorage.getAccessToken();
    const wsBase = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8082";
    const base = `${wsBase}/ws/chat`;
    return token ? `${base}?token=${encodeURIComponent(token)}` : base;
  }

  connect(): void {
    if (this.permanentlyFailed) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[ChatWS] Endpoint permanently unavailable (404) — not reconnecting");
      }
      return;
    }

    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.isIntentionalClose = false;
    this.onStatus("connecting");

    try {
      this.ws = new WebSocket(this.getWsUrl());

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.onStatus("connected");
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data) as WebSocketChatResponse;
          this.onMessage(parsed);
        } catch {
          this.onMessage({ text: event.data, sender: "AI" });
        }
      };

      this.ws.onerror = () => {
        this.onStatus("error");
      };

      this.ws.onclose = (event: CloseEvent) => {
        this.ws = null;
        this.onStatus("disconnected");

        if (this.isIntentionalClose) return;

        if (isPermanentFailure(event)) {
          this.permanentlyFailed = true;
          return;
        }

        const reason = (event.reason ?? "").toLowerCase();
        if (reason.includes("403") || reason.includes("bad response code from server: 403")) {
          this.handleAuthRefreshAndReconnect();
          return;
        }

        this.scheduleReconnect();
      };
    } catch {
      this.onStatus("error");
      this.scheduleReconnect();
    }
  }

  send(message: WebSocketChatMessage): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  disconnect(): void {
    this.isIntentionalClose = true;
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
    this.onStatus("disconnected");
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }
    this.reconnectAttempts++;
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts - 1),
      30000
    );
    this.reconnectTimeoutId = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private handleAuthRefreshAndReconnect(): void {
    if (this.reconnectTimeoutId) clearTimeout(this.reconnectTimeoutId);
    this.reconnectTimeoutId = setTimeout(() => {
      this.connect();
    }, 2000);
  }
}
