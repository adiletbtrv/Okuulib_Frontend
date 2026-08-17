"use client";

import { useState, KeyboardEvent } from "react";
import { Send, Sparkles } from "lucide-react";
import { useLanguageStore } from "../../store/useLanguageStore";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const { t } = useLanguageStore();

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
    <div className="border-t border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-colors duration-150">
      {/* Quick Suggestion Chips */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {t.aitu.quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSendMessage(prompt)}
            disabled={disabled}
            className="shrink-0 flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-[#F3F4F6] dark:bg-gray-800 px-3.5 py-1.5 text-xs font-semibold text-[#1A1A2E] dark:text-gray-200 hover:border-[#E84326]/40 hover:bg-[#E84326]/10 hover:text-[#E84326] transition-colors disabled:opacity-50"
          >
            <Sparkles className="h-3 w-3 text-[#E84326]" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="relative flex items-end rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 shadow-xs focus-within:border-[#E84326] focus-within:ring-2 focus-within:ring-[#E84326]/20 transition-all">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.aitu.inputPlaceholder}
          rows={2}
          disabled={disabled}
          className="w-full resize-none bg-transparent px-3 py-1.5 text-sm text-[#1A1A2E] dark:text-white placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
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
