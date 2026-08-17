"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Sparkles, Copy, Check } from "lucide-react";
import { useState } from "react";
import { ChatMessage } from "../../types";
import { useLanguageStore } from "../../store/useLanguageStore";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isWaiting: boolean;
}

export function ChatMessageList({ messages, isWaiting }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const { t } = useLanguageStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#FAFAFA] dark:bg-gray-950">
      {messages.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 pt-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#D63A20] to-[#E84326] text-white shadow-brand">
            <Sparkles className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#1A1A2E] dark:text-white">
              {t.aitu.welcomeTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400 mt-1 leading-relaxed">
              {t.aitu.welcomeDesc}
            </p>
          </div>
        </div>
      )}

      {messages.map((msg) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              isUser ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-xs ${
                isUser
                  ? "bg-[#1A1A2E] dark:bg-gray-700 text-white"
                  : "bg-[#E84326] text-white"
              }`}
            >
              {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                isUser
                  ? "bg-[#E84326] text-white rounded-tr-xs"
                  : "bg-white dark:bg-gray-900 text-[#1A1A2E] dark:text-gray-100 border border-gray-100 dark:border-gray-800 rounded-tl-xs"
              }`}
            >
              {isUser ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="prose prose-sm max-w-none text-[#1A1A2E] dark:text-gray-100 prose-p:leading-relaxed prose-headings:text-[#1A1A2E] dark:prose-headings:text-white prose-strong:text-[#1A1A2E] dark:prose-strong:text-white prose-code:text-[#E84326]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}

              {/* Copy Button for Assistant */}
              {!isUser && msg.content && (
                <button
                  onClick={() => handleCopy(msg.content, msg.id)}
                  title={t.aitu.copy}
                  className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-[#6B7280] dark:text-gray-400 hover:text-[#E84326] transition-colors"
                >
                  {copiedId === msg.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-500">{t.aitu.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>{t.aitu.copy}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Typing Indicator */}
      {isWaiting && (
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E84326] text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-xs border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3.5 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-[#E84326] animate-bounce [animation-delay:-0.3s]" />
            <span className="h-2 w-2 rounded-full bg-[#E84326] animate-bounce [animation-delay:-0.15s]" />
            <span className="h-2 w-2 rounded-full bg-[#E84326] animate-bounce" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
