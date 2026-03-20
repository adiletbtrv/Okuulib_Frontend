import type { WebSocketChatMessage, WebSocketChatResponse } from '../interfaces/interfaces';
import { useAuthStore } from '../store/useAuthStore';
import { config } from './config';

type OnMessageCallback = (response: WebSocketChatResponse) => void;
type OnStatusCallback = (
    status: 'connecting' | 'connected' | 'disconnected' | 'error'
) => void;

function isPermanentFailure(event: CloseEvent): boolean {
    if (event.code === 4004) return true;
    const reason = (event.reason ?? '').toLowerCase();
    return reason.includes('bad response code from server: 404') ||
        (reason.includes('404') && !reason.includes('403'));
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
        const token = useAuthStore.getState()?.accessToken;
        const base = `${config.WS_URL}/ws/chat`;
        return token ? `${base}?token=${encodeURIComponent(token)}` : base;
    }

    connect(): void {
        if (this.permanentlyFailed) {
            if (__DEV__) console.warn('[ChatWS] Endpoint permanently unavailable (404) — not reconnecting');
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
        this.onStatus('connecting');

        try {
            this.ws = new WebSocket(this.getWsUrl());

            this.ws.onopen = () => {
                if (__DEV__) console.log('[ChatWS] Connected');
                this.reconnectAttempts = 0;
                this.permanentlyFailed = false;
                this.onStatus('connected');
            };

            this.ws.onmessage = (event) => {
                try {
                    const data: WebSocketChatResponse = JSON.parse(event.data as string);
                    this.onMessage(data);
                } catch {
                    this.onMessage({ text: String(event.data), sender: 'AI' });
                }
            };

            this.ws.onerror = () => {
                this.onStatus('error');
            };

            this.ws.onclose = (event) => {
                if (__DEV__) console.log(`[ChatWS] Disconnected: ${event.code} ${event.reason}`);
                this.onStatus('disconnected');

                if (this.isIntentionalClose) return;

                if (isPermanentFailure(event)) {
                    this.permanentlyFailed = true;
                    if (__DEV__) console.warn(
                        '[ChatWS] Server returned 404 — WebSocket endpoint not found. ' +
                        'Retries disabled. Check backend /ws/chat route is registered.'
                    );
                    return;
                }
                const reason = (event.reason ?? '').toLowerCase();
                if (reason.includes('403') || reason.includes('bad response code from server: 403')) {
                    if (__DEV__) console.warn('[ChatWS] Auth rejected (403) — token may be expired. Refreshing…');
                    this.handleAuthRefreshAndReconnect();
                    return;
                }

                this.scheduleReconnect();
            };
        } catch (err) {
            if (__DEV__) console.error('[ChatWS] Could not create WebSocket:', err);
            this.onStatus('error');
            this.scheduleReconnect();
        }
    }

    send(message: WebSocketChatMessage): boolean {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            if (__DEV__) console.warn('[ChatWS] Cannot send — not connected');
            return false;
        }
        try {
            this.ws.send(JSON.stringify(message));
            return true;
        } catch (err) {
            if (__DEV__) console.error('[ChatWS] send error:', err);
            return false;
        }
    }

    disconnect(): void {
        this.isIntentionalClose = true;
        if (this.reconnectTimeoutId) {
            clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = null;
        }
        this.ws?.close();
        this.ws = null;
        this.reconnectAttempts = 0;
    }

    reset(): void {
        this.permanentlyFailed = false;
        this.reconnectAttempts = 0;
    }

    private handleAuthRefreshAndReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            if (__DEV__) console.warn('[ChatWS] Max reconnect attempts reached after 403 — giving up');
            return;
        }
        if (__DEV__) console.log('[ChatWS] Waiting 2s for token refresh before reconnecting…');
        this.reconnectTimeoutId = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
        }, 2000);
    }

    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    private scheduleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            if (__DEV__) console.warn('[ChatWS] Max reconnect attempts reached — giving up');
            return;
        }
        this.reconnectAttempts++;
        const delay = Math.min(1_000 * Math.pow(2, this.reconnectAttempts - 1), 30_000);
        if (__DEV__) console.log(
            `[ChatWS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );
        this.reconnectTimeoutId = setTimeout(() => this.connect(), delay);
    }
}