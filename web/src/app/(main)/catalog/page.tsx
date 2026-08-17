"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Loader2, BookOpen } from "lucide-react";
import { useGenres, useWorks } from "@/hooks/useBooks";
import { useLanguageStore } from "@/store/useLanguageStore";
import { BookCard } from "@/components/books/BookCard";

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguageStore();

  const selectedGenre = searchParams.get("genre") ? Number(searchParams.get("genre")) : null;
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  const { data: genres } = useGenres();
  const { data: worksData, isLoading } = useWorks({
    size: 30,
  });

  const allWorks = worksData?.content || [];

  // Filter works by search query & genre
  const filteredWorks = allWorks.filter((w) => {
    const matchesQuery = query.trim()
      ? w.title.toLowerCase().includes(query.toLowerCase()) ||
        w.authorName?.toLowerCase().includes(query.toLowerCase())
      : true;

    const matchesGenre = selectedGenre
      ? w.genres?.some((g) => g.id === selectedGenre)
      : true;

    return matchesQuery && matchesGenre;
  });

  const handleSelectGenre = (genreId: number | null) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (genreId) {
        params.set("genre", String(genreId));
      } else {
        params.delete("genre");
      }
      router.push(`/catalog?${params.toString()}`);
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A2E] dark:text-white">
          {t.catalog.title}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#6B7280] dark:text-gray-400">
          {t.catalog.subtitle}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.catalog.searchPlaceholder}
          className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-11 pr-4 py-3 text-sm text-[#1A1A2E] dark:text-white placeholder:text-gray-400 shadow-xs focus:border-[#E84326] focus:outline-none focus:ring-2 focus:ring-[#E84326]/20 transition-all"
        />
      </div>

      {/* Genre Pills Filter */}
      {genres && genres.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => handleSelectGenre(null)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold shrink-0 transition-all ${
              selectedGenre === null
                ? "bg-[#E84326] text-white shadow-sm shadow-brand-500/20"
                : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#6B7280] dark:text-gray-300 hover:text-[#1A1A2E] dark:hover:text-white hover:border-gray-300"
            }`}
          >
            {t.catalog.allGenres}
          </button>
          {genres.map((g) => {
            const isSelected = selectedGenre === g.id;
            return (
              <button
                key={g.id}
                onClick={() => handleSelectGenre(isSelected ? null : g.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold shrink-0 transition-all ${
                  isSelected
                    ? "bg-[#E84326] text-white shadow-sm shadow-brand-500/20"
                    : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#6B7280] dark:text-gray-300 hover:text-[#1A1A2E] dark:hover:text-white hover:border-gray-300"
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Books Grid */}
      {isLoading || isPending ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : filteredWorks.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filteredWorks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-gray-400">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-base font-bold text-[#1A1A2E] dark:text-white">{t.catalog.noBooksFound}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t.catalog.noBooksHint}
          </p>
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#E84326]" />
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
