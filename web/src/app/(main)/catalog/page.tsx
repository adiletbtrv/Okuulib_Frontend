"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, Filter, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { useGenres, useWorks } from "@/hooks/useBooks";
import { getCoverUrl } from "@/types";
import { Button } from "@/components/ui/Button";

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const selectedGenre = searchParams.get("genre") ? Number(searchParams.get("genre")) : null;
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  const { data: genres } = useGenres();
  const { data: worksData, isLoading } = useWorks({
    size: 24,
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Китептер каталогу
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Кыргыз адабиятынын классикалык жана заманбап чыгармаларын издеп табыңыз.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Китеп же автор боюнча издөө…"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Genre Pills Filter */}
      {genres && genres.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleSelectGenre(null)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold shrink-0 transition-all ${
              selectedGenre === null
                ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            Бардыгы
          </button>
          {genres.map((g) => {
            const isSelected = selectedGenre === g.id;
            return (
              <button
                key={g.id}
                onClick={() => handleSelectGenre(isSelected ? null : g.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold shrink-0 transition-all ${
                  isSelected
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                    : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
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
              className="h-72 animate-pulse rounded-2xl bg-zinc-900 border border-zinc-800"
            />
          ))}
        </div>
      ) : filteredWorks.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filteredWorks.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3 transition-all hover:border-zinc-700 hover:shadow-xl"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-800">
                <Image
                  src={getCoverUrl(book)}
                  alt={book.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
              </div>

              <div className="mt-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-zinc-100 group-hover:text-brand-500 transition-colors line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                    {book.authorName || "Белгисиз автор"}
                  </p>
                </div>

                {book.genres && book.genres.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-400 font-medium">
                      {book.genres[0].name}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-zinc-400">
          <BookOpen className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
          <p className="text-base font-semibold">Китептер табылган жок</p>
          <p className="text-xs text-zinc-500 mt-1">
            Издөө сөзүн же жанр чыпкасын өзгөртүп көрүңүз.
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
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
