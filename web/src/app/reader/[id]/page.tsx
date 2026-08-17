"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, BookOpen } from "lucide-react";
import { useBookDetails } from "@/hooks/useBooks";
import { useReaderStore } from "@/store/useReaderStore";
import { READER_THEMES } from "@/components/reader/ReaderThemes";
import { ReaderControls } from "@/components/reader/ReaderControls";
import { ReaderChunkView } from "@/components/reader/ReaderChunkView";
import { ReaderProgressBar } from "@/components/reader/ReaderProgressBar";
import { Button } from "@/components/ui/Button";

export default function ReaderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const workId = params.id ? Number(params.id) : 0;
  const initialChapter = searchParams.get("chapter") ? Number(searchParams.get("chapter")) : 0;

  const { theme, showControls, saveProgress, readingProgress } = useReaderStore();
  const activeTheme = READER_THEMES[theme];

  const { data: book, isLoading, error } = useBookDetails(workId);
  const [chapterIdx, setChapterIdx] = useState(initialChapter);
  const [scrollPercent, setScrollPercent] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Restore saved reading progress if available
  useEffect(() => {
    if (readingProgress[workId] && !searchParams.get("chapter")) {
      setChapterIdx(readingProgress[workId].chapterIdx);
    }
  }, [workId, readingProgress, searchParams]);

  const chapters = book?.chapters ? [...book.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber) : [];
  const currentChapter = chapters[chapterIdx];

  // Scroll Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const totalHeight = el.scrollHeight - el.clientHeight;
      if (totalHeight > 0) {
        const percent = Math.min(100, Math.max(0, (el.scrollTop / totalHeight) * 100));
        setScrollPercent(percent);
        saveProgress(workId, chapterIdx, percent);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [workId, chapterIdx, saveProgress]);

  // Scroll to top upon chapter switch
  const handleSelectChapter = useCallback((idx: number) => {
    setChapterIdx(idx);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Keyboard Shortcuts (ArrowLeft, ArrowRight, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if focus is on an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowRight") {
        if (chapterIdx < chapters.length - 1) {
          handleSelectChapter(chapterIdx + 1);
        }
      } else if (e.key === "ArrowLeft") {
        if (chapterIdx > 0) {
          handleSelectChapter(chapterIdx - 1);
        }
      } else if (e.key === " ") {
        e.preventDefault();
        window.scrollBy({ top: window.innerHeight * 0.75, behavior: "smooth" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chapterIdx, chapters.length, handleSelectChapter]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center space-y-4"
        style={{ backgroundColor: activeTheme.bg, color: activeTheme.text }}
      >
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: activeTheme.accent }} />
        <p className="text-sm font-semibold">Китептин тексти жүктөлүүдө…</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center p-4 text-center space-y-4"
        style={{ backgroundColor: activeTheme.bg, color: activeTheme.text }}
      >
        <BookOpen className="h-12 w-12 text-zinc-500 mb-2" />
        <h2 className="text-xl font-bold">Китеп жүктөлгөн жок</h2>
        <p className="text-sm text-zinc-400 max-w-sm">
          Суралган чыгарма табылган жок же серверде техникалык иштер жүрүп жатат.
        </p>
        <Link href="/catalog">
          <Button variant="primary">Каталогго кайтуу</Button>
        </Link>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center p-4 text-center space-y-4"
        style={{ backgroundColor: activeTheme.bg, color: activeTheme.text }}
      >
        <BookOpen className="h-12 w-12 text-zinc-500 mb-2" />
        <h2 className="text-xl font-bold">Бул китепте бөлүмдөр жок</h2>
        <p className="text-sm text-zinc-400">
          Чыгарманын тексти жакында толукталат.
        </p>
        <Link href={`/books/${book.workId}`}>
          <Button variant="outline">Артка кайтуу</Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{
        backgroundColor: activeTheme.bg,
        color: activeTheme.text,
      }}
    >
      {/* Top Floating Controls */}
      <ReaderControls
        book={book}
        currentChapterIdx={chapterIdx}
        onSelectChapter={handleSelectChapter}
        scrollPercent={scrollPercent}
      />

      {/* Reader Content */}
      <main className="flex-1">
        <ReaderChunkView
          chapter={currentChapter}
          chapterIdx={chapterIdx}
          totalChapters={chapters.length}
          onPrevChapter={() => handleSelectChapter(Math.max(0, chapterIdx - 1))}
          onNextChapter={() =>
            handleSelectChapter(Math.min(chapters.length - 1, chapterIdx + 1))
          }
          coverUrl={book.coverUrl}
        />
      </main>

      {/* Sticky Bottom Progress Bar */}
      <ReaderProgressBar progressPercent={scrollPercent} />
    </div>
  );
}
