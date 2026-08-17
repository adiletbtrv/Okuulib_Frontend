"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Settings2,
  Maximize2,
  Minimize2,
  Type,
  Bookmark,
  BookmarkCheck,
  ListOrdered,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import { ChapterResponse, WorkResponse } from "../../types";
import {
  ReaderFontFamily,
  ReaderMaxWidth,
  ReaderThemeMode,
  useReaderStore,
} from "../../store/useReaderStore";
import { READER_THEMES } from "./ReaderThemes";
import { useCreateBookmark } from "../../hooks/useBooks";
import { useAuthStore } from "../../store/useAuthStore";

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
    fontFamily,
    fontSize,
    lineHeight,
    maxWidth,
    setTheme,
    setFontFamily,
    setFontSize,
    setLineHeight,
    setMaxWidth,
  } = useReaderStore();

  const { isAuthenticated } = useAuthStore();
  const createBookmarkMutation = useCreateBookmark();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const activeTheme = READER_THEMES[theme];
  const chapters = book.chapters || [];
  const currentChapter: ChapterResponse | undefined = chapters[currentChapterIdx];

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Save Bookmark Handler
  const handleSaveBookmark = () => {
    if (!isAuthenticated) {
      alert("Бетбелгини сактоо үчүн алгач аккаунтуңузга кириңиз.");
      return;
    }

    createBookmarkMutation.mutate(
      {
        workId: book.workId,
        chapterId: currentChapter?.chapterNumber || 1,
        chunkId: currentChapter?.chunks?.[0]?.chunkId || 1,
        startOffset: scrollPercent,
        endOffset: scrollPercent,
        userNote: `Окуу прогресси: ${scrollPercent}% (${currentChapter?.chapterTitle || "Бөлүм"})`,
      },
      {
        onSuccess: () => {
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 3000);
        },
      }
    );
  };

  return (
    <>
      <header
        style={{
          backgroundColor: activeTheme.surface,
          borderColor: activeTheme.border,
          color: activeTheme.text,
        }}
        className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b px-4 shadow-sm transition-colors duration-200"
      >
        {/* Left: Back & Book Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/books/${book.workId}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border transition-opacity hover:opacity-80"
            style={{ borderColor: activeTheme.border, backgroundColor: activeTheme.bg }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-bold truncate tracking-tight">{book.title}</h1>
            <p className="text-xs truncate" style={{ color: activeTheme.muted }}>
              {currentChapter?.chapterTitle ?? `Бөлүм ${currentChapterIdx + 1}`} • {currentChapterIdx + 1} / {chapters.length}
            </p>
          </div>
        </div>

        {/* Center: Chapter Prev/Next Quick Navigation */}
        <div className="hidden md:flex items-center gap-1.5 rounded-xl border p-1" style={{ borderColor: activeTheme.border, backgroundColor: activeTheme.bg }}>
          <button
            onClick={() => onSelectChapter(Math.max(0, currentChapterIdx - 1))}
            disabled={currentChapterIdx === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-30 hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsTocOpen(!isTocOpen)}
            className="flex items-center gap-1.5 px-3 text-xs font-semibold"
          >
            <ListOrdered className="h-3.5 w-3.5" />
            <span>Мазмуну</span>
          </button>
          <button
            onClick={() => onSelectChapter(Math.min(chapters.length - 1, currentChapterIdx + 1))}
            disabled={currentChapterIdx === chapters.length - 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-30 hover:opacity-80 transition-opacity"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-2">
          {/* Bookmark Button */}
          <button
            onClick={handleSaveBookmark}
            title="Бетбелги сактоо"
            className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all"
            style={{
              borderColor: activeTheme.border,
              backgroundColor: isSaved ? activeTheme.accent : activeTheme.bg,
              color: isSaved ? "#FFFFFF" : activeTheme.text,
            }}
          >
            {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            title="Окуу параметрлери (шрифт, тема)"
            className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all hover:opacity-80"
            style={{ borderColor: activeTheme.border, backgroundColor: activeTheme.bg }}
          >
            <Settings2 className="h-4 w-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Экрандан чыгуу" : "Толук экран"}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border transition-all hover:opacity-80"
            style={{ borderColor: activeTheme.border, backgroundColor: activeTheme.bg }}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Settings Modal Drawer */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-20">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsSettingsOpen(false)}
          />
          <div
            style={{
              backgroundColor: activeTheme.surface,
              borderColor: activeTheme.border,
              color: activeTheme.text,
            }}
            className="relative w-full max-w-sm rounded-2xl border p-5 shadow-2xl transition-all"
          >
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: activeTheme.border }}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Settings2 className="h-4 w-4" style={{ color: activeTheme.accent }} />
                Окуу параметрлери
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-xs font-semibold hover:opacity-70"
              >
                Жабуу
              </button>
            </div>

            <div className="space-y-5 pt-4 text-xs">
              {/* Theme Selection */}
              <div>
                <label className="font-semibold block mb-2" style={{ color: activeTheme.muted }}>
                  Түс палитрасы
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(READER_THEMES) as ReaderThemeMode[]).map((t) => {
                    const themeItem = READER_THEMES[t];
                    const isSelected = theme === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex items-center gap-2 rounded-xl border p-2.5 font-medium transition-all ${
                          isSelected ? "ring-2 ring-brand-500 font-bold" : "opacity-80 hover:opacity-100"
                        }`}
                        style={{
                          backgroundColor: themeItem.bg,
                          color: themeItem.text,
                          borderColor: themeItem.border,
                        }}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border"
                          style={{ backgroundColor: themeItem.surface, borderColor: themeItem.border }}
                        />
                        <span>{themeItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="font-semibold block mb-2" style={{ color: activeTheme.muted }}>
                  Шрифт түрү
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "sans", label: "Sans" },
                    { id: "serif", label: "Serif" },
                    { id: "mono", label: "Mono" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setFontFamily(item.id as ReaderFontFamily)}
                      className={`rounded-lg border py-2 text-center font-medium transition-all ${
                        fontFamily === item.id ? "border-brand-500 text-brand-500 font-bold" : ""
                      }`}
                      style={{
                        backgroundColor: activeTheme.bg,
                        borderColor: fontFamily === item.id ? activeTheme.accent : activeTheme.border,
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Slider */}
              <div>
                <div className="flex justify-between mb-1.5 font-semibold">
                  <span style={{ color: activeTheme.muted }}>Шрифт өлчөмү</span>
                  <span>{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={14}
                  max={28}
                  step={1}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer"
                />
              </div>

              {/* Line Height Slider */}
              <div>
                <div className="flex justify-between mb-1.5 font-semibold">
                  <span style={{ color: activeTheme.muted }}>Сап аралыгы</span>
                  <span>{lineHeight.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={1.4}
                  max={2.4}
                  step={0.1}
                  value={lineHeight}
                  onChange={(e) => setLineHeight(Number(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer"
                />
              </div>

              {/* Column Width */}
              <div>
                <label className="font-semibold block mb-2" style={{ color: activeTheme.muted }}>
                  Тексттин туурасы
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: "max-w-2xl", label: "Тар" },
                    { id: "max-w-3xl", label: "Орто" },
                    { id: "max-w-4xl", label: "Кең" },
                    { id: "max-w-5xl", label: "Толук" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setMaxWidth(item.id as ReaderMaxWidth)}
                      className={`rounded-lg border py-1.5 text-center text-[11px] font-medium transition-all ${
                        maxWidth === item.id ? "border-brand-500 text-brand-500 font-bold" : ""
                      }`}
                      style={{
                        backgroundColor: activeTheme.bg,
                        borderColor: maxWidth === item.id ? activeTheme.accent : activeTheme.border,
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table of Contents Drawer */}
      {isTocOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsTocOpen(false)}
          />
          <div
            style={{
              backgroundColor: activeTheme.surface,
              borderColor: activeTheme.border,
              color: activeTheme.text,
            }}
            className="relative w-full max-w-md max-h-[70vh] flex flex-col rounded-2xl border p-5 shadow-2xl transition-all"
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: activeTheme.border }}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ListOrdered className="h-4 w-4" style={{ color: activeTheme.accent }} />
                Китептин мазмуну ({chapters.length} бөлүм)
              </h3>
              <button
                onClick={() => setIsTocOpen(false)}
                className="text-xs font-semibold hover:opacity-70"
              >
                Жабуу
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pt-3">
              {chapters.map((ch, idx) => (
                <button
                  key={ch.chapterNumber}
                  onClick={() => {
                    onSelectChapter(idx);
                    setIsTocOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-medium transition-colors ${
                    currentChapterIdx === idx
                      ? "bg-brand-500/10 text-brand-500 font-bold border border-brand-500/20"
                      : "hover:opacity-80"
                  }`}
                  style={{ backgroundColor: currentChapterIdx === idx ? undefined : activeTheme.bg }}
                >
                  <span className="truncate">{ch.chapterTitle || `Бөлүм ${idx + 1}`}</span>
                  <span className="text-[10px] ml-2 opacity-60">№ {idx + 1}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
