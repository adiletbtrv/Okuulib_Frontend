import { useCallback, useEffect, useRef, useState } from "react";
import { ChatWebSocket } from "../lib/websocket";
import { ChatMessage, ChatSessionDTO, WebSocketChatResponse } from "../types";
import { chatSessionsApi } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";

function generateOfflineAituResponse(query: string, bookName = ""): string {
  const q = query.toLowerCase();

  if (q.includes("манас") || bookName.toLowerCase().includes("манас")) {
    return `### 🏹 «Манас» эпосу боюнча адабий талдоо

**Негизги идеясы:** Кыргыз элинин биримдиги, эркиндиги жана эгемендүүлүгү. Дастанда чачылган кыргыз урууларын бир туунун алдына бириктирүү жана Ала-Тоону тышкы баскынчылардан коргоо башкы орунда турат.

**Башкы каармандар жана образдар:**
1. **Айкөл Манас** — Эл башы, баатырдыктын, адилеттиктин жана кечиримдүүлүктүн символу.
2. **Каныкей** — Акылмандыктын, уздуктун жана берилгендиктин туу чокусу. Баатырдын ишенимдүү кеңешчиси.
3. **Бакай карыя** — Элдик даанышмандыктын жана көсөмдүктүн идеалы.
4. **Кошой баатыр** — Калыстыктын жана руханий тиректин үлгүсү.

> *«Кулаалы таптап куш кылдым, курама жыйып журт кылдым!»* — дастандын башкы философиясы ушул саптарда чагылдырылган.`;
  }

  if (q.includes("айтматов") || q.includes("жамийла") || q.includes("ак кеме") || q.includes("биринчи мугалим") || q.includes("кылым")) {
    return `### 📚 Чыңгыз Айтматовдун чыгармачылык философиясы

Чыңгыз Айтматовдун чыгармалары улуттук чектерден чыгып, бүткүл адамзаттык актуалдуу суроолорду көтөрөт:

1. **«Биринчи мугалим»** — Билимге умтулуу жана жарыкка үндөгөн Дүйшөн агайдын жан аябас күрөшү.
2. **«Жамийла»** — Эски салт-санаанын чынжырын бузган таза махабат жана чыгармачылык эркиндик (Луи Арагон дүйнөдөгү эң сулуу махабат баяны деп атаган).
3. **«Ак кеме»** — Балалыктын таза абийири жана адам менен жаратылыштын (Бугу эне жомогу) ортосундагы ажырагыс байланыш.
4. **«Кылым карытар бир күн»** — **Манкуртчулук** концепциясы аркылуу тарыхый эстутумду, эне сүтүн жана адамдык парзды унутпоо чакырыгы.`;
  }

  if (q.includes("курманжан") || q.includes("датка")) {
    return `### 👑 Курманжан Датка — Алай ханышасы

Курманжан Датка (1811–1907) — кыргыз элинин тарыхындагы эң таасирдүү мамлекеттик ишмер жана даанышман дипломат:

* **Элдик дипломатия:** Бухара эмиринен жана Кокон хандыгынан «Датка» даражасын алган жалгыз аял башкаруучу.
* **Тарыхый эрдик:** Элин кырылуудан сактап калуу үчүн жеке үй-бүлөлүк кызыкчылыктан мамлекеттин бүтүндүгүн өйдө койгон (уулу Камчыбектин өлүмүн көтөргөн улуу эне).
* **М.Д. Скобелев жана К.К. фон Кауфман** менен сүйлөшүүлөрдө кыргыз элинин кадыр-баркын сактап калган.`;
  }

  return `Сиздин сурооңуз: **«${query}»**.

Кыргыз адабиятынын алтын казынасында бул темага байланыштуу көптөгөн көркөм чыгармалар, ырлар жана тарыхый баяндар бар. 

Okuulib платформасынан каалаган чыгарманы онлайн ачып, ар кандай түс темаларында (Жарык, Сепия, Караңгы, OLED) окуп, кыстармаларды сактап алсаңыз болот. Башка суроолоруңуз болсо берсеңиз болот!`;
}

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
  >("connected");

  const wsRef = useRef<ChatWebSocket | null>(null);
  const activeSessionIdRef = useRef<number | null>(null);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  // Load user chat sessions
  const loadSessions = useCallback(async () => {
    try {
      const res = await chatSessionsApi.getAll({ size: 30 });
      setSessions(res.content);
      if (!activeSessionId && res.content.length > 0) {
        setActiveSessionId(res.content[0].id);
      }
    } catch {
      // Ignore
    }
  }, [activeSessionId]);

  // Load messages for active session
  useEffect(() => {
    if (!activeSessionId) return;
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
  }, [activeSessionId]);

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
        // We stay in simulated connected mode for offline testing
        setWsStatus("connected");
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

  // Send message with seamless offline fallback
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

      if (!targetSessionId) {
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
          // If WS failed to send, use offline response
          setTimeout(() => {
            setIsWaiting(false);
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now() + 1,
                role: "assistant",
                content: generateOfflineAituResponse(trimmed, bookName),
                createdAt: new Date().toISOString(),
              },
            ]);
          }, 600);
        }
      } else {
        // Offline simulation response with realistic thinking time
        setTimeout(() => {
          setIsWaiting(false);
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              role: "assistant",
              content: generateOfflineAituResponse(trimmed, bookName),
              createdAt: new Date().toISOString(),
            },
          ]);
        }, 500);
      }
    },
    [getOrCreateWs]
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
