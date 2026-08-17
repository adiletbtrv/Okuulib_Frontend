"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { useAituChat } from "@/hooks/useAituChat";
import { ChatMessageList } from "@/components/aitu/ChatMessageList";
import { ChatInput } from "@/components/aitu/ChatInput";
import { SessionHistory } from "@/components/aitu/SessionHistory";

function AituChatContent() {
  const searchParams = useSearchParams();
  const bookParam = searchParams.get("book") || "";

  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    messages,
    isWaiting,
    wsStatus,
    sendMessage,
    createNewSession,
  } = useAituChat();

  // If redirected with bookParam, prefill or send initial welcome
  useEffect(() => {
    if (bookParam && messages.length === 0) {
      sendMessage(`«${bookParam}» чыгармасынын негизги идеясы жана каармандары жөнүндө айтып бериңизчи.`, bookParam);
    }
  }, [bookParam]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-zinc-950">
      {/* Session History Sidebar (Desktop) */}
      <div className="hidden md:block">
        <SessionHistory
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onNewSession={createNewSession}
        />
      </div>

      {/* Main Chat View */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Aitu AI Ассистент
                <span
                  className={`h-2 w-2 rounded-full ${
                    wsStatus === "connected"
                      ? "bg-emerald-500 animate-pulse"
                      : wsStatus === "connecting"
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  title={`Статус: ${wsStatus}`}
                />
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            {bookParam && (
              <span className="rounded-md border border-brand-500/20 bg-brand-500/10 px-2 py-0.5 text-brand-400 font-medium">
                Контекст: {bookParam}
              </span>
            )}
          </div>
        </div>

        {/* Message Stream */}
        <ChatMessageList messages={messages} isWaiting={isWaiting} />

        {/* Input */}
        <ChatInput onSendMessage={(msg) => sendMessage(msg, bookParam)} disabled={isWaiting} />
      </div>
    </div>
  );
}

export default function AituPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      }
    >
      <AituChatContent />
    </Suspense>
  );
}
