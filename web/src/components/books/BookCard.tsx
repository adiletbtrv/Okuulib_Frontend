"use client";

import Link from "next/link";
import Image from "next/image";
import { AllWorksDTO, WorkResponse, getCoverUrl } from "../../types";

interface BookCardProps {
  book: AllWorksDTO | WorkResponse;
  width?: string;
  showTitle?: boolean;
}

export function BookCard({ book, width = "w-full", showTitle = true }: BookCardProps) {
  const coverUrl = getCoverUrl(book);
  const title = book.title || "Аталышсыз";
  const author = "authorName" in book ? book.authorName : book.author?.name || "";
  const id = "id" in book ? book.id : book.workId;

  return (
    <Link
      href={`/books/${id}`}
      className={`group flex flex-col ${width} transition-all duration-200`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-gray-100 shadow-xs transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md border border-gray-100">
        <Image
          src={coverUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
        {/* Subtle hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {showTitle && (
        <div className="mt-2 space-y-0.5">
          <h3 className="text-[13px] font-bold text-[#1A1A2E] leading-snug line-clamp-1 group-hover:text-[#E84326] transition-colors">
            {title}
          </h3>
          {author && (
            <p className="text-[11px] font-normal text-[#6B7280] line-clamp-1">
              {author}
            </p>
          )}
        </div>
      )}
    </Link>
  );
}
