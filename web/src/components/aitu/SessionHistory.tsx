"use client";

import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { ChatSessionDTO } from "../../types";
import { formatDate } from "../../lib/utils";

interface SessionHistoryProps {
  sessions: ChatSessionDTO[];
  activeSessionId: number | null;
  onSelectSession: (id: number) => void;
  onNewSession: () => void;
}

export function SessionHistory({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
}: SessionHistoryProps) {
  return (
    <aside className="flex h-full w-72 flex-col border-r border-zinc-800 bg-zinc-950 p-4">
      {/* New Chat Button */}
      <button
        onClick={onNewSession}
        className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-[0.98] mb-4"
      >
        <Plus className="h-4 w-4" />
        <span>Жаңы диалог</span>
      </button>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        <h4 className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          Сүйлөшүүлөр тарыхы
        </h4>
        {sessions.length > 0 ? (
          sessions.map((s) => {
            const isActive = activeSessionId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition-colors ${
                  isActive
                    ? "bg-zinc-800 text-white font-semibold border border-zinc-700/80"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? "text-brand-500" : ""}`} />
                <div className="flex-1 min-w-0">
                  <p className="truncate">{s.title || "Диалог"}</p>
                  <span className="text-[10px] text-zinc-500">
                    {formatDate(s.createdAt)}
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="py-8 text-center text-xs text-zinc-600">
            Азырынча сүйлөшүүлөр жок
          </div>
        )}
      </div>
    </aside>
  );
}
