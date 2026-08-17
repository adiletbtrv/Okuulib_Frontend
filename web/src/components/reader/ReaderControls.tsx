"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Type,
  Bookmark,
  BookmarkCheck,
  ListOrdered,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import { WorkResponse, ChapterResponse } from "../../types";
import { useReaderStore } from "../../store/useReaderStore";
import { READER_THEMES } from "./ReaderThemes";
import { useCreateBookmark } from "../../hooks/useBooks";

interface ReaderControlsProps {
  book: WorkResponse;
  currentChapterIdx: number;
  onSelectChapter: (idx: number) => void;
  scrollPercent: number;
}

export function ReaderControls({
  book,
  currentChapterIdx,
  onSelectChapter,
  scrollPercent,
}: ReaderControlsProps) {
  const {
    theme,
    fontSize,
    lineHeight,
    fontFamily,
    setTheme,
    setFontSize,
    setLineHeight,
    setFontFamily,
  } = useReaderStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const createBookmarkMutation = useCreateBookmark();
  const activeTheme = READER_THEMES[theme] || READER_THEMES.light;

  const chapters = book.chapters || [];
  const currentChapter = chapters[currentChapterIdx];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleBookmark = () => {
    if (!currentChapter) return;
    const firstChunk = currentChapter.chunks?.[0];
    createBookmarkMutation.mutate({
      workId: book.workId,
      chapterId: currentChapter.chapterNumber,
      chunkId: firstChunk?.chunkId || 1,
      startOffset: 0,
      endOffset: 0,
      userNote: `Бөлүм: ${currentChapter.chapterTitle || `${currentChapterIdx + 1}-бөлүм`} (${Math.round(scrollPercent)}%)`,
    });
    setIsBookmarked(true);
  };

  return (
    <>
      {/* Top Floating Reader Bar */}
      <header
        className="sticky top-0 z-40 flex h-14 items-center justify-between px-4 sm:px-6 shadow-xs border-b transition-colors duration-200 backdrop-blur-md"
        style={{
          backgroundColor: activeTheme.surface,
          borderColor: activeTheme.border,
          color: activeTheme.text,
        }}
      >
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/books/${book.workId}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-black/5"
            title="Артка"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-bold truncate max-w-[160px] sm:max-w-xs md:max-w-md">
              {book.title}
            </h1>
            <p className="text-[11px] truncate opacity-70">
              {currentChapter?.chapterTitle || `${currentChapterIdx + 1}-бөлүм`}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* TOC Trigger */}
          <button
            onClick={() => setShowTOC(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-black/5"
            title="Мазмуну"
          >
            <ListOrdered className="h-4 w-4" />
          </button>

          {/* Typography Settings */}
          <button
            onClick={() => setShowSettings((p) => !p)}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-black/5"
            title="Шрифт жана темалар"
          >
            <Type className="h-4 w-4" />
          </button>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-black/5"
            title="Кыстарма сактоо"
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-[#E84326]" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-black/5"
            title="Толук экран"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 backdrop-blur-xs bg-black/20 animate-in fade-in duration-150"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-5 border animate-in zoom-in-95 duration-150"
            style={{
              backgroundColor: activeTheme.surface,
              borderColor: activeTheme.border,
              color: activeTheme.text,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: activeTheme.border }}>
              <h3 className="text-sm font-extrabold">Окуу параметрлери</h3>
              <button onClick={() => setShowSettings(false)}>
                <X className="h-4 w-4 opacity-70" />
              </button>
            </div>

            {/* Themes */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                Түс темасы
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.values(READER_THEMES).map((t) => {
                  const isSelected = theme === t.name;
                  return (
                    <button
                      key={t.name}
                      onClick={() => setTheme(t.name as any)}
                      className={`flex flex-col items-center justify-center rounded-2xl py-2.5 px-2 text-xs font-bold transition-all border ${
                        isSelected
                          ? "ring-2 ring-[#E84326] shadow-sm"
                          : "opacity-80 hover:opacity-100"
                      }`}
                      style={{
                        backgroundColor: t.bg,
                        color: t.text,
                        borderColor: t.border,
                      }}
                    >
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Family */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                Шрифттин түрү
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "sans", label: "Sans" },
                  { key: "serif", label: "Serif" },
                  { key: "mono", label: "Mono" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFontFamily(f.key as any)}
                    className={`rounded-xl py-2 text-xs font-bold border transition-colors ${
                      fontFamily === f.key
                        ? "bg-[#E84326] text-white border-[#E84326]"
                        : "border-gray-300 hover:bg-black/5"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold opacity-70">
                <span>Шрифт өлчөмү</span>
                <span>{fontSize}px</span>
              </div>
              <input
                type="range"
                min={14}
                max={28}
                step={1}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-[#E84326]"
              />
            </div>

            {/* Line Height */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold opacity-70">
                <span>Сап аралыгы</span>
                <span>{lineHeight.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={1.4}
                max={2.4}
                step={0.1}
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="w-full accent-[#E84326]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Table of Contents Drawer */}
      {showTOC && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-start p-4 pt-16 backdrop-blur-xs bg-black/20 animate-in fade-in duration-150"
          onClick={() => setShowTOC(false)}
        >
          <div
            className="h-[80vh] w-full max-w-md rounded-3xl p-5 shadow-2xl flex flex-col border animate-in slide-in-from-left duration-150"
            style={{
              backgroundColor: activeTheme.surface,
              borderColor: activeTheme.border,
              color: activeTheme.text,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-3" style={{ borderColor: activeTheme.border }}>
              <h3 className="text-sm font-extrabold">Китептин мазмуну ({chapters.length})</h3>
              <button onClick={() => setShowTOC(false)}>
                <X className="h-4 w-4 opacity-70" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {chapters.map((ch, idx) => {
                const isCurrent = idx === currentChapterIdx;
                return (
                  <button
                    key={ch.chapterNumber}
                    onClick={() => {
                      onSelectChapter(idx);
                      setShowTOC(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-colors ${
                      isCurrent
                        ? "bg-[#E84326] text-white font-bold shadow-xs"
                        : "hover:bg-black/5"
                    }`}
                  >
                    <span className="truncate">
                      {ch.chapterTitle || `${idx + 1}-бөлүм`}
                    </span>
                    <span className="text-[10px] opacity-70">
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
