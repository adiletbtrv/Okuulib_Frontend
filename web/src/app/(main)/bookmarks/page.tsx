"use client";

import Link from "next/link";
import { Bookmark, Trash2, BookOpen, Loader2, ArrowRight } from "lucide-react";
import { useBookmarks, useDeleteBookmark } from "@/hooks/useBooks";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { formatDate } from "@/lib/utils";

export default function BookmarksPage() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const { t } = useLanguageStore();
  const { data: bookmarksData, isLoading } = useBookmarks();
  const deleteBookmarkMutation = useDeleteBookmark();

  const bookmarks = bookmarksData?.content || [];

  if (isHydrated && !isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-[#E84326] shadow-sm">
          <Bookmark className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-extrabold text-[#1A1A2E] dark:text-white">
          {t.bookmarks.loginPrompt}
        </h2>
        <p className="text-sm text-[#6B7280] dark:text-gray-400">
          {t.bookmarks.loginPromptDesc}
        </p>
        <div className="pt-2">
          <Link href="/login">
            <button className="rounded-2xl bg-[#E84326] px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-brand-500/25 hover:bg-[#D63A20] active:scale-95 transition-all">
              {t.bookmarks.loginBtn}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A2E] dark:text-white">
          {t.bookmarks.title}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#6B7280] dark:text-gray-400">
          {t.bookmarks.subtitle}
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#E84326]" />
        </div>
      ) : bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map((bm) => (
            <div
              key={bm.id}
              className="flex flex-col justify-between rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs transition-all hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-[#1A1A2E] dark:text-white line-clamp-1">
                      {bm.workTitle || "Китеп"}
                    </h3>
                    <p className="text-xs text-[#E84326] font-bold mt-0.5">
                      {bm.chapterTitle || "Бөлүм"}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteBookmarkMutation.mutate(bm.id)}
                    title="Өчүрүү"
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {bm.userNote && (
                  <p className="text-xs text-[#1A1A2E] dark:text-gray-200 bg-[#F3F4F6] dark:bg-gray-800 rounded-2xl p-3 leading-relaxed font-normal">
                    {bm.userNote}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
                <span className="text-[11px] text-gray-400">
                  {formatDate(bm.createdAt)}
                </span>
                <Link href={`/reader/${bm.workId}`}>
                  <button className="inline-flex items-center gap-1 rounded-xl bg-[#E84326] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#D63A20] active:scale-95 transition-all">
                    <span>{t.bookmarks.continueReading}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-3">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="text-base font-bold text-[#1A1A2E] dark:text-white">
            {t.bookmarks.noBookmarks}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {t.bookmarks.noBookmarksDesc}
          </p>
          <div className="pt-2">
            <Link href="/catalog">
              <button className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-2.5 text-xs font-bold text-[#1A1A2E] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                {t.bookmarks.chooseBook}
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
