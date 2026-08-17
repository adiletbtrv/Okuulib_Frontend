"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, BookOpen, Loader2, ArrowRight, CornerDownLeft } from "lucide-react";
import { useSearchBooks } from "../../hooks/useSearch";
import { getCoverUrl } from "../../types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const { items, search, clear, loading } = useSearchBooks();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      clear();
    }
  }, [isOpen, clear]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    search(val);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900 shadow-2xl shadow-black/80">
        {/* Search Bar Input */}
        <div className="flex items-center border-b border-zinc-800 px-4 py-3.5">
          <Search className="h-5 w-5 text-zinc-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Китептин аталышы, автору же темасы..."
            className="flex-1 bg-transparent text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          {loading && <Loader2 className="h-5 w-5 animate-spin text-brand-500 mr-2" />}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {items.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Табылган китептер ({items.length})
              </div>
              {items.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  onClick={onClose}
                  className="group flex items-center gap-4 rounded-xl p-2.5 transition-colors hover:bg-zinc-800/70"
                >
                  <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                    <Image
                      src={getCoverUrl(book)}
                      alt={book.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-brand-500 truncate transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {book.authorName || "Белгисиз автор"}
                    </p>
                    {book.genres && book.genres.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {book.genres.slice(0, 2).map((g) => (
                          <span
                            key={g.id}
                            className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400"
                          >
                            {g.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-brand-500 transition-colors" />
                </Link>
              ))}
            </div>
          ) : query.trim() ? (
            !loading && (
              <div className="py-12 text-center text-zinc-400">
                <BookOpen className="mx-auto h-10 w-10 text-zinc-600 mb-3" />
                <p className="text-sm font-medium">Эч нерсе табылган жок</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Башка сөз менен издеп көрүңүз же катасын текшериңиз
                </p>
              </div>
            )
          ) : (
            <div className="py-8 px-4 text-center">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-3">
                Популярдуу издөөлөр
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Манас", "Чыңгыз Айтматов", "Романдар", "Поэзия", "Тарых"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setQuery(tag);
                      search(tag);
                    }}
                    className="rounded-full border border-zinc-800 bg-zinc-800/40 px-3 py-1 text-xs text-zinc-300 hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-brand-500 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-950/60 px-4 py-2 text-[11px] text-zinc-500">
          <div className="flex items-center gap-2">
            <span>Тандоо үчүн</span>
            <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 text-zinc-300">
              <CornerDownLeft className="inline h-3 w-3" /> Enter
            </kbd>
          </div>
          <div className="flex items-center gap-2">
            <span>Жабуу үчүн</span>
            <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 text-zinc-300">
              Esc
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
