"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, User, Copy, Check, BookOpen } from "lucide-react";
import { useState } from "react";
import { ChatMessage } from "../../types";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isWaiting: boolean;
}

export function ChatMessageList({ messages, isWaiting }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  const copyToClipboard = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 shadow-xl shadow-brand-500/20 mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Aitu AI адабий жардамчысы
          </h3>
          <p className="max-w-md text-sm text-zinc-400 leading-relaxed">
            Кыргыз адабияты, эпостор, Чыңгыз Айтматовдун чыгармалары, каармандардын
            талдоосу жана тарыхый контекст боюнча каалаган сурооңузду бериңиз.
          </p>
        </div>
      )}

      {messages.map((msg) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={msg.id}
            className={`flex gap-3 sm:gap-4 ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            {!isUser && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/20 mt-0.5">
                <Sparkles className="h-4 w-4" />
              </div>
            )}

            <div
              className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3.5 text-sm shadow-md ${
                isUser
                  ? "bg-brand-500 text-white rounded-br-none"
                  : "border border-zinc-800 bg-zinc-900/90 text-zinc-100 rounded-bl-none"
              }`}
            >
              {isUser ? (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}

              {!isUser && (
                <div className="mt-2 flex items-center justify-end border-t border-zinc-800/80 pt-2">
                  <button
                    onClick={() => copyToClipboard(msg.id, msg.content)}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Көчүрүлдү</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Көчүрүү</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {isUser && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 mt-0.5">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        );
      })}

      {isWaiting && (
        <div className="flex gap-3 sm:gap-4 justify-start">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/20">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
          <div className="rounded-2xl rounded-bl-none border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400 flex items-center gap-2">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-brand-500 animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
              <span className="h-2 w-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
            </div>
            <span>Aitu ойлонуп жатат…</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
