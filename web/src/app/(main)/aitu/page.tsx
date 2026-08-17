"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
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

  // If redirected with bookParam, prefill or send initial question
  useEffect(() => {
    if (bookParam && messages.length === 0) {
      sendMessage(`«${bookParam}» чыгармасынын негизги идеясы жана каармандары жөнүндө айтып бериңизчи.`, bookParam);
    }
  }, [bookParam]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#FAFAFA]">
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
      <div className="flex flex-1 flex-col overflow-hidden bg-[#FAFAFA]">
        {/* Top Header */}
        <div className="flex h-14 items-center justify-between border-b border-gray-200/80 bg-white px-4 sm:px-6 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#D63A20] to-[#E84326] text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#1A1A2E] flex items-center gap-2">
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

          <div className="flex items-center gap-2 text-xs">
            {bookParam && (
              <span className="rounded-full bg-[#E84326]/10 px-3 py-1 text-[#E84326] font-bold">
                Контекст: {bookParam}
              </span>
            )}
          </div>
        </div>

        {/* Message Stream */}
        <ChatMessageList messages={messages} isWaiting={isWaiting} />

        {/* Input */}
        <ChatInput onSendMessage={(msg: string) => sendMessage(msg, bookParam)} disabled={isWaiting} />
      </div>
    </div>
  );
}

export default function AituPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-[#FAFAFA]">
          <Loader2 className="h-8 w-8 animate-spin text-[#E84326]" />
        </div>
      }
    >
      <AituChatContent />
    </Suspense>
  );
}
