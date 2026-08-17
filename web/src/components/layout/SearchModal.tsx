"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Loader2, BookOpen, ArrowRight } from "lucide-react";
import { useSearchBooks } from "../../hooks/useSearch";
import { getCoverUrl } from "../../types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const { items: results, search, clear, loading: isSearching } = useSearchBooks();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      clear();
    }
  }, [isOpen, clear]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        search(query);
      } else {
        clear();
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, search, clear]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 backdrop-blur-xs bg-black/40 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-3xl border border-gray-100 bg-white p-4 shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="relative flex items-center border-b border-gray-100 pb-3">
          <Search className="h-5 w-5 text-[#E84326] ml-2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Кыргыз китептери, эпостор, авторлор боюнча издөө…"
            className="w-full bg-transparent px-3.5 py-2 text-base text-[#1A1A2E] placeholder:text-gray-400 focus:outline-none"
          />
          {isSearching && (
            <Loader2 className="h-4 w-4 animate-spin text-[#E84326] mr-2" />
          )}
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="mt-3 max-h-[60vh] overflow-y-auto space-y-2 pr-1">
          {results.length > 0 ? (
            results.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                onClick={onClose}
                className="flex items-center gap-3.5 rounded-2xl p-2.5 hover:bg-gray-50 transition-colors group"
              >
                <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                  <Image
                    src={getCoverUrl(book)}
                    alt={book.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[#1A1A2E] group-hover:text-[#E84326] transition-colors truncate">
                    {book.title}
                  </h4>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {book.authorName || "Белгисиз автор"}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-[#E84326] transition-all -translate-x-2 group-hover:translate-x-0" />
              </Link>
            ))
          ) : query.trim() && !isSearching ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <BookOpen className="mx-auto h-8 w-8 text-gray-300" />
              <p className="text-sm font-medium">«{query}» боюнча эч нерсе табылган жок</p>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-gray-400">
              Издөө үчүн китептин же автордун атын жазыңыз
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
