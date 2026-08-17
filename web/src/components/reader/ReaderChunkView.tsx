"use client";

import Image from "next/image";
import { ChapterResponse, ChunkResponse } from "../../types";
import { useReaderStore } from "../../store/useReaderStore";
import { READER_THEMES } from "./ReaderThemes";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ReaderChunkViewProps {
  chapter?: ChapterResponse;
  chapterIdx: number;
  totalChapters: number;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  coverUrl?: string;
}

export function ReaderChunkView({
  chapter,
  chapterIdx,
  totalChapters,
  onPrevChapter,
  onNextChapter,
  coverUrl,
}: ReaderChunkViewProps) {
  const { theme, fontFamily, fontSize, lineHeight, maxWidth } = useReaderStore();
  const activeTheme = READER_THEMES[theme];

  const fontClass =
    fontFamily === "serif"
      ? "font-serif"
      : fontFamily === "mono"
      ? "font-mono"
      : "font-sans";

  const sortedChunks = [...(chapter?.chunks || [])].sort(
    (a, b) => a.chunkNumber - b.chunkNumber
  );

  const isFirst = chapterIdx === 0;
  const isLast = chapterIdx === totalChapters - 1;

  return (
    <article
      className={`mx-auto w-full px-6 py-12 transition-all ${maxWidth} ${fontClass}`}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight,
        color: activeTheme.text,
      }}
    >
      {/* Chapter Eyebrow & Title */}
      <div className="mb-10 text-center border-b pb-8" style={{ borderColor: activeTheme.border }}>
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: activeTheme.accent }}
        >
          {chapterIdx + 1}-бөлүм / {totalChapters}
        </p>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {chapter?.chapterTitle || `Бөлүм ${chapterIdx + 1}`}
        </h2>
      </div>

      {/* Chunks */}
      <div className="space-y-6">
        {sortedChunks.length > 0 ? (
          sortedChunks.map((chunk: ChunkResponse) => (
            <div key={chunk.chunkId} className="leading-relaxed">
              {chunk.chunkType === "image" ? (
                <div className="relative my-8 h-80 w-full overflow-hidden rounded-2xl bg-zinc-800 shadow-md">
                  <Image
                    src={chunk.text || coverUrl || "/images/default-cover.png"}
                    alt={`Иллюстрация: ${chapter?.chapterTitle}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className="prose max-w-none transition-colors"
                  style={{ color: activeTheme.text }}
                  dangerouslySetInnerHTML={{ __html: chunk.text }}
                />
              )}
            </div>
          ))
        ) : (
          <div className="py-16 text-center text-sm" style={{ color: activeTheme.muted }}>
            Бул бөлүмдүн тексти азырынча жүктөлө элек.
          </div>
        )}
      </div>

      {/* Chapter Navigation Buttons */}
      <div
        className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-8 pb-16"
        style={{ borderColor: activeTheme.border }}
      >
        <button
          onClick={onPrevChapter}
          disabled={isFirst}
          className={`flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border px-6 py-3.5 text-sm font-semibold transition-all ${
            isFirst ? "opacity-30 cursor-not-allowed" : "hover:opacity-80 active:scale-95"
          }`}
          style={{
            backgroundColor: activeTheme.surface,
            borderColor: activeTheme.border,
            color: activeTheme.text,
          }}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Мурунку бөлүм</span>
        </button>

        <button
          onClick={onNextChapter}
          disabled={isLast}
          className={`flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all ${
            isLast ? "opacity-30 cursor-not-allowed" : "hover:opacity-90 active:scale-95 shadow-brand-500/20"
          }`}
          style={{
            backgroundColor: activeTheme.accent,
          }}
        >
          <span>Кийинки бөлүм</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
