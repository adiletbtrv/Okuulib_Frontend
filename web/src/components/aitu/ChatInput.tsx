"use client";

import { useState, KeyboardEvent } from "react";
import { Send, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const QUICK_PROMPTS = [
  "«Манас» эпосунун негизги идеясы кайсы?",
  "Чыңгыз Айтматовдун «Кылым карытар бир күн» чыгармасы",
  "Курманжан Датка тууралуу чыгармалар",
  "Сүймөнкул Чокморов жөнүндө маалымат",
];

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSendMessage(trimmed);
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200/80 bg-white p-4">
      {/* Quick Suggestion Chips */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSendMessage(prompt)}
            disabled={disabled}
            className="shrink-0 flex items-center gap-1.5 rounded-full border border-gray-200 bg-[#F3F4F6] px-3.5 py-1.5 text-xs font-semibold text-[#1A1A2E] hover:border-[#E84326]/40 hover:bg-[#E84326]/10 hover:text-[#E84326] transition-colors disabled:opacity-50"
          >
            <Sparkles className="h-3 w-3 text-[#E84326]" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="relative flex items-end rounded-2xl border border-gray-200 bg-white p-2 shadow-xs focus-within:border-[#E84326] focus-within:ring-2 focus-within:ring-[#E84326]/20 transition-all">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Aitu'га кыргыз адабияты боюнча суроо бериңиз… (Enter жөнөтүү)"
          rows={2}
          disabled={disabled}
          className="w-full resize-none bg-transparent px-3 py-1.5 text-sm text-[#1A1A2E] placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E84326] text-white shadow-md shadow-brand-500/20 hover:bg-[#D63A20] disabled:opacity-30 disabled:hover:bg-[#E84326] transition-all active:scale-95"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
