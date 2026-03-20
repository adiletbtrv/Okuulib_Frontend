import { icons } from "@/constants/icons";
import type { WebSocketChatResponse } from "@/interfaces/interfaces";
import { chatSessionsApi } from "@/lib/api";
import { ChatWebSocket } from "@/lib/websocket";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const C = {
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceHigh: "#F3F4F6",
  border: "#E5E7EB",
  accent: "#E84326",
  accentDim: "rgba(232,67,38,0.08)",
  white: "#FFFFFF",
  offWhite: "#1A1A2E",
  muted: "#9CA3AF",
  mutedLight: "#6B7280",
  userBubble: "#E84326",
  aiBubble: "#F3F4F6",
};

interface Message { id: number; role: "user" | "assistant"; content: string; }
interface ChatSession { id: number; title: string; messages: Message[]; createdAt: Date; }

// Typing indicator 
function TypingDots() {
  const d1 = useRef(new Animated.Value(0)).current;
  const d2 = useRef(new Animated.Value(0)).current;
  const d3 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const dot = (v: Animated.Value, delay: number) => Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: -4, duration: 280, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.delay(560),
      ])
    );
    Animated.parallel([dot(d1, 0), dot(d2, 160), dot(d3, 320)]).start();
  }, []);
  const dot = (v: Animated.Value) => <Animated.View style={[ts.dot, { transform: [{ translateY: v }] }]} />;
  return <View style={ts.wrap}>{dot(d1)}{dot(d2)}{dot(d3)}</View>;
}
const ts = StyleSheet.create({ wrap: { flexDirection: "row", gap: 4, alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.muted } });

export default function Aitu() {
  const insets = useSafeAreaInsets();
  const { accessToken } = useAuthStore();
  const isAuthenticated = !!accessToken;

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);


  const listRef = useRef<FlatList<Message>>(null);
  const wsRef = useRef<ChatWebSocket | null>(null);
  const activeSessionIdRef = useRef<number | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => { activeSessionIdRef.current = activeSessionId; }, [activeSessionId]);

  // Sidebar animations
  const slideAnim = useRef(new Animated.Value(-320)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  // Content fade-in
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;
  const messages = activeSession?.messages ?? [];
  const currentTitle = activeSession?.title ?? "Aitu";

  // Page entrance
  useFocusEffect(useCallback(() => {
    fadeAnim.setValue(0); slideUp.setValue(24);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, damping: 22, stiffness: 200, useNativeDriver: true }),
    ]).start();
  }, []));

  // Load sessions lazily
  const loadSessions = useCallback(async () => {
    if (!isAuthenticated || sessionsLoaded) return;
    try {
      const result = await chatSessionsApi.getAll({ size: 50 });
      setSessions(result.content.map((s) => ({ id: s.id, title: s.title, messages: [], createdAt: new Date(s.createdAt ?? Date.now()) })));
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status !== 404 && __DEV__) console.warn("[Aitu] Failed to load sessions:", err);
    } finally { setSessionsLoaded(true); }
  }, [isAuthenticated, sessionsLoaded]);

  useFocusEffect(useCallback(() => { loadSessions(); }, [loadSessions]));



  // WS callbacks
  const onWsMessage = useCallback((response: WebSocketChatResponse) => {
    setIsWaitingForAI(false);
    const sid = activeSessionIdRef.current;
    setSessions((prev) => prev.map((s) => s.id === sid ? { ...s, messages: [...s.messages, { id: Date.now() + 1, role: "assistant", content: response.text }] } : s));
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const onWsStatus = useCallback((status: string) => { if (status === "error") setIsWaitingForAI(false); }, []);

  const getOrCreateWs = useCallback(() => {
    if (wsRef.current?.isConnected()) return wsRef.current;
    wsRef.current?.disconnect();
    const ws = new ChatWebSocket(onWsMessage, onWsStatus);
    ws.connect();
    wsRef.current = ws;
    return ws;
  }, [onWsMessage, onWsStatus]);

  useEffect(() => () => { wsRef.current?.disconnect(); wsRef.current = null; }, []);

  // Sidebar
  const openSidebar = () => {
    setIsSidebarOpen(true);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, damping: 22, stiffness: 220, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  };
  const closeSidebar = () => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: -320, damping: 22, stiffness: 220, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => setIsSidebarOpen(false));
  };

  const handleNewChat = async () => {
    if (isAuthenticated) {
      try {
        const created = await chatSessionsApi.create({ title: "Жаңы чат" });
        const s: ChatSession = { id: created.id, title: created.title, messages: [], createdAt: new Date(created.createdAt ?? Date.now()) };
        setSessions((p) => [s, ...p]); setActiveSessionId(s.id); setInput(""); closeSidebar(); return;
      } catch (err: unknown) { const st = (err as { response?: { status?: number } })?.response?.status; if (st !== 404 && __DEV__) console.warn("[Aitu] create session:", err); }
    }
    const local: ChatSession = { id: Date.now(), title: "Жаңы чат", messages: [], createdAt: new Date() };
    setSessions((p) => [local, ...p]); setActiveSessionId(local.id); setInput(""); closeSidebar();
  };

  const selectChat = async (sessionId: number) => {
    setActiveSessionId(sessionId); closeSidebar();
    const existing = sessions.find((s) => s.id === sessionId);
    if (existing && existing.messages.length > 0) return;
    try {
      const detail = await chatSessionsApi.getById(sessionId);
      if (detail.messages?.length) {
        const loaded: Message[] = detail.messages.map((m) => ({ id: m.id, role: m.role, content: m.content }));
        setSessions((p) => p.map((s) => s.id === sessionId ? { ...s, messages: loaded } : s));
      }
    } catch (err: unknown) { const st = (err as { response?: { status?: number } })?.response?.status; if (st !== 404 && __DEV__) console.warn("[Aitu] load messages:", err); }
  };

  const deleteChat = async (sessionId: number) => {
    if (isAuthenticated) {
      try {
        await chatSessionsApi.delete(sessionId);
      } catch (err) {
        if (__DEV__) console.warn("[Aitu] delete chat:", err);
      }
    }
    setSessions((p) => p.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) setActiveSessionId(null);
  };

  const appendError = (sid: number | null) => {
    setSessions((p) => p.map((s) => s.id === (sid ?? p[0]?.id) ? { ...s, messages: [...s.messages, { id: Date.now() + 1, role: "assistant", content: "Байланыш жок. Кийинчерээк аракет кылыңыз." }] } : s));
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isWaitingForAI) return;
    setInput("");
    const shortTitle = text.length > 30 ? text.slice(0, 30) + "…" : text;
    const userMsg: Message = { id: Date.now(), role: "user", content: text };
    let targetId = activeSessionId;

    if (!activeSession) {
      if (isAuthenticated) {
        try {
          const c = await chatSessionsApi.create({ title: shortTitle });
          const s: ChatSession = { id: c.id, title: c.title, messages: [userMsg], createdAt: new Date(c.createdAt ?? Date.now()) };
          setSessions((p) => [s, ...p]); setActiveSessionId(s.id); targetId = s.id;
        } catch { const s: ChatSession = { id: Date.now(), title: shortTitle, messages: [userMsg], createdAt: new Date() }; setSessions((p) => [s, ...p]); setActiveSessionId(s.id); targetId = s.id; }
      } else { const s: ChatSession = { id: Date.now(), title: shortTitle, messages: [userMsg], createdAt: new Date() }; setSessions((p) => [s, ...p]); setActiveSessionId(s.id); targetId = s.id; }
    } else {
      setSessions((p) => p.map((s) => s.id === activeSessionId ? { ...s, messages: [...s.messages, userMsg], title: s.messages.length === 0 ? shortTitle : s.title } : s));
    }

    setIsWaitingForAI(true);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

    const ws = getOrCreateWs();
    const trySend = () => {
      const sent = ws.send({ query: text, bookName: "", sessionId: targetId ?? 0 });
      if (!sent) { setIsWaitingForAI(false); appendError(targetId); }
    };
    if (ws.isConnected()) { trySend(); }
    else {
      let waited = 0;
      const poll = setInterval(() => {
        waited += 200;
        if (ws.isConnected()) { clearInterval(poll); trySend(); }
        else if (waited >= 3000) { clearInterval(poll); setIsWaitingForAI(false); appendError(targetId); }
      }, 200);
    }
  };

  // Render message
  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.role === "user";
    const showAvatar = !isUser && (index === 0 || messages[index - 1]?.role === "user");
    return (
      <View style={[ms.row, isUser ? ms.rowUser : ms.rowAI]}>
        {!isUser && (
          <View style={[ms.avatar, { opacity: showAvatar ? 1 : 0 }]}>
            <Image source={icons.logo} style={ms.avatarImg} resizeMode="contain" />
          </View>
        )}
        <View style={[ms.bubble, isUser ? ms.userBubble : ms.aiBubble]}>
          <Text style={[ms.bubbleText, isUser && ms.userBubbleText]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  const renderChatItem = ({ item }: { item: ChatSession }) => {
    const active = item.id === activeSessionId;
    return (
      <View style={[sb.chatItem, active && sb.chatItemActive]}>
        <TouchableOpacity style={{ flex: 1, flexDirection: "row", alignItems: "center" }} onPress={() => selectChat(item.id)} activeOpacity={0.7}>
          <View style={[sb.chatDot, active && sb.chatDotActive]} />
          <Text style={[sb.chatTitle, active && sb.chatTitleActive]} numberOfLines={1}>{item.title}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteChat(item.id)} style={sb.deleteBtn} activeOpacity={0.6}>
          <Ionicons name="trash-outline" size={16} color={C.muted} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[s.root]} edges={["top"]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={0}>

          {/* Header */}
          <Animated.View style={[s.header, { opacity: fadeAnim }]}>
            <TouchableOpacity style={s.menuBtn} onPress={openSidebar} activeOpacity={0.7}>
              <View style={s.menuLine} />
              <View style={[s.menuLine, { width: 14 }]} />
            </TouchableOpacity>

            <Text style={s.headerTitle} numberOfLines={1}>{currentTitle}</Text>

            <TouchableOpacity style={s.newBtn} onPress={handleNewChat} activeOpacity={0.7}>
              <Ionicons name="create-outline" size={22} color={C.accent} />
            </TouchableOpacity>
          </Animated.View>

          {/* Messages */}
          <Animated.View style={[s.flex, { opacity: fadeAnim, transform: [{ translateY: slideUp }] }]}>
            {messages.length > 0 ? (
              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderMessage}
                contentContainerStyle={s.messageList}
                showsVerticalScrollIndicator={false}
                onScrollBeginDrag={Keyboard.dismiss}
                keyboardShouldPersistTaps="handled"
                ListFooterComponent={isWaitingForAI ? (
                  <View style={ms.row}>
                    <View style={ms.avatar}><Image source={icons.logo} style={ms.avatarImg} resizeMode="contain" /></View>
                    <View style={ms.aiBubble}><TypingDots /></View>
                  </View>
                ) : null}
              />
            ) : (
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={s.empty}>
                  <Image source={icons.logo} style={s.emptyLogo} resizeMode="contain" />
                  <Text style={s.emptyTitle}>Aitu</Text>
                  <Text style={s.emptySubtitle}>Сизге кандайча жардам бере алам?</Text>
                  {/* Suggestion chips */}
                  <View style={s.chips}>
                    {["Китеп сунушта", "Жазуучу жөнүндө айтып бер", "Сюжет түшүндүр"].map((chip) => (
                      <TouchableOpacity key={chip} onPress={() => { setInput(chip); inputRef.current?.focus(); }} style={s.chip} activeOpacity={0.7}>
                        <Text style={s.chipText}>{chip}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            )}
          </Animated.View>

          {/* Input bar */}
          <Animated.View style={[s.inputFloat, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12, opacity: fadeAnim }]}>
            <View style={s.inputRow}>
              <TextInput
                ref={inputRef}
                value={input}
                onChangeText={setInput}
                placeholder="Жазыңыз…"
                placeholderTextColor={C.muted}
                style={s.textInput}
                multiline
                maxLength={500}
                returnKeyType="default"
              />
              <TouchableOpacity
                style={[s.sendBtn, (!input.trim() || isWaitingForAI) && s.sendBtnDisabled]}
                onPress={handleSend}
                activeOpacity={0.8}
                disabled={isWaitingForAI || !input.trim()}
              >
                <Ionicons name="arrow-up" size={18} color={C.white} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Sidebar */}
      <Modal visible={isSidebarOpen} transparent animationType="none" onRequestClose={closeSidebar} statusBarTranslucent>
        <View style={sb.modal}>
          <Animated.View style={[sb.overlay, { opacity: overlayAnim }]}>
            <TouchableWithoutFeedback onPress={closeSidebar}><View style={StyleSheet.absoluteFill} /></TouchableWithoutFeedback>
          </Animated.View>

          <Animated.View style={[sb.panel, { transform: [{ translateX: slideAnim }], paddingTop: insets.top }]}>
            <View style={sb.panelHeader}>
              <Text style={sb.panelTitle}>Чаттар</Text>
              <TouchableOpacity onPress={handleNewChat} activeOpacity={0.7} style={sb.newChatBtn}>
                <Ionicons name="add" size={20} color={C.accent} />
              </TouchableOpacity>
            </View>

            {sessions.length > 0 ? (
              <FlatList
                data={sessions}
                keyExtractor={(s) => String(s.id)}
                renderItem={renderChatItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 8 }}
              />
            ) : (
              <View style={sb.empty}>
                <Ionicons name="chatbubbles-outline" size={40} color={C.muted} />
                <Text style={sb.emptyText}>Азырынча чаттар жок.{"\n"}Жаңы чат баштаңыз!</Text>
              </View>
            )}

            <View style={[sb.panelFooter, { paddingBottom: insets.bottom + 16 }]}>
              <Text style={sb.footerText}>{isAuthenticated ? "Чаттар серверде сакталат" : "Кирсеңиз чаттар сакталат"}</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Main styles
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  menuBtn: { width: 36, height: 36, justifyContent: "center", gap: 6 },
  menuLine: { width: 22, height: 1.5, backgroundColor: C.offWhite, borderRadius: 2 },
  headerTitle: { flex: 1, color: C.offWhite, fontSize: 16, fontWeight: "600", letterSpacing: -0.3, textAlign: "center", marginHorizontal: 12 },
  newBtn: { width: 36, height: 36, alignItems: "flex-end", justifyContent: "center" },
  messageList: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, flexGrow: 1 },
  // Empty state
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  emptyLogo: { width: 48, height: 48, marginBottom: 16, opacity: 0.9 },
  emptyTitle: { color: C.offWhite, fontSize: 22, fontWeight: "700", letterSpacing: -0.4, marginBottom: 6 },
  emptySubtitle: { color: C.muted, fontSize: 14, marginBottom: 28, textAlign: "center" },
  chips: { gap: 10, alignItems: "center" },
  chip: { backgroundColor: C.surfaceHigh, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9, borderWidth: 1, borderColor: C.border },
  chipText: { color: C.mutedLight, fontSize: 13 },
  inputFloat: { paddingHorizontal: 16, paddingTop: 8, backgroundColor: C.bg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border },
  inputRow: { flexDirection: "row", alignItems: "flex-end", backgroundColor: C.surface, borderRadius: 26, paddingLeft: 18, paddingRight: 6, paddingBottom: 6, paddingTop: 6, borderWidth: 1, borderColor: C.border, gap: 8 },
  textInput: { flex: 1, color: C.offWhite, fontSize: 15, minHeight: 40, maxHeight: 120, paddingVertical: 10, textAlignVertical: "center" },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.accent, alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { backgroundColor: C.surfaceHigh, opacity: 0.4 },
});

// Message styles
const ms = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", marginBottom: 6, gap: 8 },
  rowUser: { justifyContent: "flex-end" },
  rowAI: { justifyContent: "flex-start" },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.surface, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImg: { width: 20, height: 20 },
  bubble: { maxWidth: "78%", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble: { backgroundColor: C.accent, borderBottomRightRadius: 6 },
  aiBubble: { backgroundColor: C.surfaceHigh, borderBottomLeftRadius: 6 },
  bubbleText: { fontSize: 15, lineHeight: 22, color: C.offWhite },
  userBubbleText: { color: C.white },
});

// Sidebar styles
const sb = StyleSheet.create({
  modal: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  panel: { position: "absolute", left: 0, top: 0, bottom: 0, width: 300, backgroundColor: C.surface, borderRightWidth: 1, borderRightColor: C.border },
  panelHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  panelTitle: { color: C.offWhite, fontSize: 20, fontWeight: "700", letterSpacing: -0.4 },
  newChatBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.accentDim, alignItems: "center", justifyContent: "center" },
  chatItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  chatItemActive: { backgroundColor: C.accentDim },
  chatDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.muted },
  chatDotActive: { backgroundColor: C.accent },
  chatTitle: { flex: 1, color: C.mutedLight, fontSize: 14, textAlign: "center", paddingRight: 10 },
  chatTitleActive: { color: C.offWhite, fontWeight: "500" },
  deleteBtn: { padding: 8, marginRight: -8, zIndex: 10 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  emptyText: { color: C.muted, fontSize: 13, textAlign: "center", lineHeight: 20 },
  panelFooter: { paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.border },
  footerText: { color: C.muted, fontSize: 11, textAlign: "center" },
});