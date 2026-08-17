"use client";

import { READER_THEMES } from "./ReaderThemes";
import { useReaderStore } from "../../store/useReaderStore";

interface ReaderProgressBarProps {
  progressPercent: number;
}

export function ReaderProgressBar({ progressPercent }: ReaderProgressBarProps) {
  const theme = useReaderStore((s) => s.theme);
  const activeTheme = READER_THEMES[theme];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 flex h-7 items-center justify-between border-t px-4 text-[11px] font-medium backdrop-blur-md transition-colors"
      style={{
        backgroundColor: activeTheme.surface,
        borderColor: activeTheme.border,
        color: activeTheme.muted,
      }}
    >
      {/* Progress Track */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-zinc-700/20">
        <div
          className="h-full bg-brand-500 transition-all duration-150"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      <div>
        <span>Okuulib Web Reader</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="tabular-nums font-semibold" style={{ color: activeTheme.text }}>
          {Math.round(progressPercent)}%
        </span>
        <span>прогресс</span>
      </div>
    </div>
  );
}
