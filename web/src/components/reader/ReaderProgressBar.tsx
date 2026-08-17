"use client";

import { useReaderStore } from "../../store/useReaderStore";
import { READER_THEMES } from "./ReaderThemes";

interface ReaderProgressBarProps {
  progressPercent: number;
}

export function ReaderProgressBar({ progressPercent }: ReaderProgressBarProps) {
  const { theme } = useReaderStore();
  const activeTheme = READER_THEMES[theme] || READER_THEMES.light;

  return (
    <div
      className="sticky bottom-0 z-30 flex h-7 items-center justify-between px-4 text-[11px] font-semibold border-t backdrop-blur-md transition-colors duration-200"
      style={{
        backgroundColor: activeTheme.surface,
        borderColor: activeTheme.border,
        color: activeTheme.muted,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="font-bold">{Math.round(progressPercent)}%</span>
        <span>окулду</span>
      </div>

      {/* Bar container */}
      <div className="h-1.5 w-32 sm:w-48 overflow-hidden rounded-full bg-black/10">
        <div
          className="h-full rounded-full transition-all duration-150"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: activeTheme.accent,
          }}
        />
      </div>
    </div>
  );
}
