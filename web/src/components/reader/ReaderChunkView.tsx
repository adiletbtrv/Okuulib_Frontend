"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ChapterResponse, ChunkResponse } from "../../types";
import { useReaderStore } from "../../store/useReaderStore";
import { READER_THEMES } from "./ReaderThemes";

interface ReaderChunkViewProps {
  chapter: ChapterResponse;
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
  const { theme, fontSize, lineHeight, fontFamily, maxWidth } = useReaderStore();
  const activeTheme = READER_THEMES[theme] || READER_THEMES.light;

  const fontClass =
    fontFamily === "serif"
      ? "font-serif"
      : fontFamily === "mono"
      ? "font-mono"
      : "font-sans";

  const chunks = chapter?.chunks ? [...chapter.chunks].sort((a, b) => a.chunkNumber - b.chunkNumber) : [];

  return (
    <article
      className={`mx-auto ${maxWidth} px-4 sm:px-8 py-10 sm:py-16 ${fontClass} transition-all duration-200`}
      style={{ color: activeTheme.text }}
    >
      {/* Chapter Title Banner */}
      <header className="mb-12 text-center border-b pb-8" style={{ borderColor: activeTheme.border }}>
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: activeTheme.accent }}
        >
          {chapterIdx + 1}-бөлүм / {totalChapters}
        </span>
        <h1 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight">
          {chapter.chapterTitle || `${chapterIdx + 1}-бөлүм`}
        </h1>
      </header>

      {/* Chunks Stream */}
      <div
        className="space-y-6"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
        }}
      >
        {chunks.length > 0 ? (
          chunks.map((chunk: ChunkResponse) => {
            if (chunk.chunkType === "image") {
              return (
                <figure key={chunk.chunkId || chunk.chunkNumber} className="my-8 overflow-hidden rounded-2xl">
                  <div className="relative aspect-video w-full">
                    <Image
                      src={chunk.text}
                      alt={`Иллюстрация: ${chapter.chapterTitle}`}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </figure>
              );
            }

            // HTML / text content
            return (
              <div
                key={chunk.chunkId || chunk.chunkNumber}
                className="reader-content leading-relaxed"
                dangerouslySetInnerHTML={{ __html: chunk.text }}
              />
            );
          })
        ) : (
          <div className="py-12 text-center text-sm opacity-60">
            Бул бөлүмдүн тексти азырынча толук эмес.
          </div>
        )}
      </div>

      {/* Chapter Navigation Footer */}
      <footer className="mt-16 flex items-center justify-between border-t pt-8" style={{ borderColor: activeTheme.border }}>
        <button
          onClick={onPrevChapter}
          disabled={chapterIdx === 0}
          className="inline-flex items-center gap-1.5 rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold border transition-all disabled:opacity-30 disabled:pointer-events-none hover:bg-black/5"
          style={{
            borderColor: activeTheme.border,
            color: activeTheme.text,
          }}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Мурунку бөлүм</span>
        </button>

        <span className="text-xs font-semibold opacity-60">
          {chapterIdx + 1} / {totalChapters}
        </span>

        <button
          onClick={onNextChapter}
          disabled={chapterIdx === totalChapters - 1}
          className="inline-flex items-center gap-1.5 rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold text-white transition-all disabled:opacity-30 disabled:pointer-events-none shadow-xs"
          style={{
            backgroundColor: activeTheme.accent,
          }}
        >
          <span>Кийинки бөлүм</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </footer>
    </article>
  );
}
