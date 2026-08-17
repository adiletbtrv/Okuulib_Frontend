"use client";

import { useState, KeyboardEvent } from "react";
import { Send, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const QUICK_PROMPTS = [
  "«Манас» эпосунун негизги идеясы кайсы?",
  "Чыңгыз Айтматовдун «Кылым карытар бир күн» романынын мааниси",
  "Курманжан Датка тууралуу чыгармалар",
  "Сүймөнкул Чокморов жөнүндө айтып бер",
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
    <div className="border-t border-zinc-800 bg-zinc-950 p-4">
      {/* Quick Suggestion Chips */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSendMessage(prompt)}
            disabled={disabled}
            className="shrink-0 flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-300 hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-brand-400 transition-colors disabled:opacity-50"
          >
            <Sparkles className="h-3 w-3 text-brand-500" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="relative flex items-end rounded-2xl border border-zinc-800 bg-zinc-900 p-2 shadow-inner focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Aitu'га кыргыз адабияты боюнча суроо бериңиз… (Enter жөнөтүү)"
          rows={2}
          disabled={disabled}
          className="w-full resize-none bg-transparent px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 disabled:opacity-30 disabled:hover:bg-brand-500 transition-all active:scale-95"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
