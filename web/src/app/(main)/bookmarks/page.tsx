"use client";

import Link from "next/link";
import { Bookmark, Trash2, BookOpen, Loader2, ArrowRight } from "lucide-react";
import { useBookmarks, useDeleteBookmark } from "@/hooks/useBooks";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDate } from "@/lib/utils";

export default function BookmarksPage() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const { data: bookmarksData, isLoading } = useBookmarks();
  const deleteBookmarkMutation = useDeleteBookmark();

  const bookmarks = bookmarksData?.content || [];

  if (isHydrated && !isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-3xl bg-white border border-gray-100 text-[#E84326] shadow-sm">
          <Bookmark className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-extrabold text-[#1A1A2E]">
          Сакталгандарды көрүү үчүн кириңиз
        </h2>
        <p className="text-sm text-[#6B7280]">
          Окуу прогрессиңизди жана кыстармаларыңызды сактоо үчүн аккаунтуңузга кириңиз.
        </p>
        <div className="pt-2">
          <Link href="/login">
            <button className="rounded-2xl bg-[#E84326] px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-brand-500/25 hover:bg-[#D63A20] active:scale-95 transition-all">
              Кирүү
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A2E]">
          Сакталган бетбелгилер
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#6B7280]">
          Сиз белгилеп койгон китептер жана акыркы токтогон жерлериңиз.
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
              className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-[#1A1A2E] line-clamp-1">
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
                  <p className="text-xs text-[#1A1A2E] bg-[#F3F4F6] rounded-2xl p-3 leading-relaxed font-normal">
                    {bm.userNote}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-[11px] text-gray-400">
                  {formatDate(bm.createdAt)}
                </span>
                <Link href={`/reader/${bm.workId}`}>
                  <button className="inline-flex items-center gap-1 rounded-xl bg-[#E84326] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#D63A20] active:scale-95 transition-all">
                    <span>Окууну улантуу</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-3">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="text-base font-bold text-[#1A1A2E]">
            Азырынча сакталган бетбелгилер жок
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Китепти окуп жатканда жогорку тилкедеги бетбелги баскычын басып,
            каалаган баракты сактап койсоңуз болот.
          </p>
          <div className="pt-2">
            <Link href="/catalog">
              <button className="rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-[#1A1A2E] hover:bg-gray-50 transition-all">
                Китеп тандоо
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
