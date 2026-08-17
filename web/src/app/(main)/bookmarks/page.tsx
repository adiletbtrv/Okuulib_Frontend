"use client";

import Link from "next/link";
import Image from "next/image";
import { Bookmark, Trash2, BookOpen, Loader2, ArrowRight } from "lucide-react";
import { useBookmarks, useDeleteBookmark } from "@/hooks/useBooks";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export default function BookmarksPage() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const { data: bookmarksData, isLoading } = useBookmarks();
  const deleteBookmarkMutation = useDeleteBookmark();

  const bookmarks = bookmarksData?.content || [];

  if (isHydrated && !isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-brand-500">
          <Bookmark className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Сакталгандарды көрүү үчүн кириңиз</h2>
        <p className="text-sm text-zinc-400">
          Окуу прогрессиңизди жана кыстармаларыңызды сактоо үчүн аккаунтуңузга кириңиз.
        </p>
        <div className="pt-2">
          <Link href="/login">
            <Button variant="primary">Кирүү</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Сакталган бетбелгилер
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Сиз белгилеп койгон китептер жана акыркы токтогон жерлериңиз.
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map((bm) => (
            <div
              key={bm.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-xl"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white line-clamp-1">
                      {bm.workTitle || "Китеп"}
                    </h3>
                    <p className="text-xs text-brand-400 font-semibold mt-0.5">
                      {bm.chapterTitle || "Бөлүм"}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteBookmarkMutation.mutate(bm.id)}
                    title="Өчүрүү"
                    className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {bm.userNote && (
                  <p className="text-xs text-zinc-300 bg-zinc-800/60 rounded-xl p-3 leading-relaxed">
                    {bm.userNote}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-zinc-800/80 pt-3">
                <span className="text-[11px] text-zinc-500">
                  {formatDate(bm.createdAt)}
                </span>
                <Link href={`/reader/${bm.workId}`}>
                  <Button variant="primary" size="sm" className="gap-1 text-xs">
                    <span>Окууну улантуу</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center space-y-3">
          <BookOpen className="mx-auto h-12 w-12 text-zinc-600" />
          <h3 className="text-base font-bold text-zinc-300">
            Азырынча сакталган бетбелгилер жок
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Китепти окуп жатканда жогорку тилкедеги бетбелги баскычын басып,
            каалаган баракты сактап койсоңуз болот.
          </p>
          <div className="pt-2">
            <Link href="/catalog">
              <Button variant="outline" size="sm">
                Китеп тандоо
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
