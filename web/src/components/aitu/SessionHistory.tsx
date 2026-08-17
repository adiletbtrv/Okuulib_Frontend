"use client";

import { Plus, MessageSquare } from "lucide-react";
import { ChatSessionDTO } from "../../types";
import { formatDate } from "../../lib/utils";
import { useLanguageStore } from "../../store/useLanguageStore";

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
  const { t } = useLanguageStore();

  return (
    <aside className="flex h-full w-72 flex-col border-r border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-colors duration-150">
      {/* New Chat Button */}
      <button
        onClick={onNewSession}
        className="flex items-center justify-center gap-2 rounded-2xl bg-[#E84326] py-3 px-4 text-sm font-bold text-white shadow-md shadow-brand-500/20 hover:bg-[#D63A20] transition-all active:scale-[0.98] mb-4"
      >
        <Plus className="h-4 w-4" />
        <span>{t.aitu.newChat}</span>
      </button>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        <h4 className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-gray-400">
          {t.aitu.history}
        </h4>
        {sessions.length > 0 ? (
          sessions.map((s) => {
            const isActive = activeSessionId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className={`w-full flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-xs transition-colors ${
                  isActive
                    ? "bg-[#E84326]/10 text-[#E84326] dark:bg-[#E84326]/20 font-bold border border-[#E84326]/20"
                    : "text-[#6B7280] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#1A1A2E] dark:hover:text-white"
                }`}
              >
                <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? "text-[#E84326]" : "text-gray-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold">{s.title || t.aitu.title}</p>
                  <span className="text-[10px] text-gray-400">
                    {formatDate(s.createdAt)}
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="py-8 text-center text-xs text-gray-400">
            {t.aitu.noHistory}
          </div>
        )}
      </div>
    </aside>
  );
}
