import { useCallback, useEffect, useRef, useState } from "react";
import { ChatWebSocket } from "../lib/websocket";
import { ChatMessage, ChatSessionDTO, WebSocketChatResponse } from "../types";
import { chatSessionsApi } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";

export function useAituChat(initialSessionId?: number) {
  const { isAuthenticated } = useAuthStore();
  const [sessions, setSessions] = useState<ChatSessionDTO[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(
    initialSessionId ?? null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [wsStatus, setWsStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");

  const wsRef = useRef<ChatWebSocket | null>(null);
  const activeSessionIdRef = useRef<number | null>(null);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  // Load user chat sessions
  const loadSessions = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await chatSessionsApi.getAll({ size: 30 });
      setSessions(res.content);
      if (!activeSessionId && res.content.length > 0) {
        setActiveSessionId(res.content[0].id);
      }
    } catch {
      // Ignore 404
    }
  }, [isAuthenticated, activeSessionId]);

  // Load messages for active session
  useEffect(() => {
    if (!activeSessionId || !isAuthenticated) return;
    let isMounted = true;

    chatSessionsApi
      .getById(activeSessionId)
      .then((session) => {
        if (isMounted && session.messages) {
          setMessages(session.messages);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [activeSessionId, isAuthenticated]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // WebSocket message handlers
  const handleWsMessage = useCallback((response: WebSocketChatResponse) => {
    setIsWaiting(false);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "assistant",
        content: response.text,
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const handleWsStatus = useCallback(
    (status: "connecting" | "connected" | "disconnected" | "error") => {
      setWsStatus(status);
      if (status === "error" || status === "disconnected") {
        setIsWaiting(false);
      }
    },
    []
  );

  const getOrCreateWs = useCallback(() => {
    if (wsRef.current?.isConnected()) return wsRef.current;
    wsRef.current?.disconnect();
    const ws = new ChatWebSocket(handleWsMessage, handleWsStatus);
    ws.connect();
    wsRef.current = ws;
    return ws;
  }, [handleWsMessage, handleWsStatus]);

  useEffect(() => {
    const ws = getOrCreateWs();
    return () => {
      ws.disconnect();
      wsRef.current = null;
    };
  }, [getOrCreateWs]);

  // Send message
  const sendMessage = useCallback(
    async (text: string, bookName = "") => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: ChatMessage = {
        id: Date.now(),
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsWaiting(true);

      let targetSessionId = activeSessionIdRef.current;

      if (!targetSessionId && isAuthenticated) {
        try {
          const shortTitle = trimmed.length > 25 ? trimmed.slice(0, 25) + "…" : trimmed;
          const newSession = await chatSessionsApi.create({ title: shortTitle });
          targetSessionId = newSession.id;
          setActiveSessionId(newSession.id);
          setSessions((prev) => [newSession, ...prev]);
        } catch {
          targetSessionId = Date.now();
        }
      }

      const ws = getOrCreateWs();
      const payload = {
        query: trimmed,
        bookName: bookName || "",
        sessionId: targetSessionId || 0,
      };

      if (ws.isConnected()) {
        const sent = ws.send(payload);
        if (!sent) {
          setIsWaiting(false);
        }
      } else {
        // Poll briefly until open
        let attempts = 0;
        const interval = setInterval(() => {
          attempts += 1;
          if (ws.isConnected()) {
            clearInterval(interval);
            ws.send(payload);
          } else if (attempts >= 15) {
            clearInterval(interval);
            setIsWaiting(false);
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now() + 1,
                role: "assistant",
                content: "Байланыш үзүлдү. Сурооңузду бир аздан кийин кайра берип көрүңүз.",
                createdAt: new Date().toISOString(),
              },
            ]);
          }
        }, 200);
      }
    },
    [getOrCreateWs, isAuthenticated]
  );

  const createNewSession = useCallback(async (title = "Жаңы диалог") => {
    try {
      const session = await chatSessionsApi.create({ title });
      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(session.id);
      setMessages([]);
      return session;
    } catch {
      const tempId = Date.now();
      setActiveSessionId(tempId);
      setMessages([]);
      return { id: tempId, title };
    }
  }, []);

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    messages,
    isWaiting,
    wsStatus,
    sendMessage,
    createNewSession,
  };
}
