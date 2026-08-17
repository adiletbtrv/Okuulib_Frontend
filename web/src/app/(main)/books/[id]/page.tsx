import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  User,
  ListOrdered,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { WorkResponse, getCoverUrl } from "@/types";
import { Badge } from "@/components/ui/Card";
import { BookCard } from "@/components/books/BookCard";

interface Props {
  params: Promise<{ id: string }>;
}

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8082";

async function getBook(id: string): Promise<WorkResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/works/${id}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return null;
    return (await res.json()) as WorkResponse;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    return {
      title: "Китеп табылган жок",
    };
  }

  const cover = getCoverUrl(book);
  const authorName = book.author?.name || "Кыргыз адабияты";

  return {
    title: `${book.title} — ${authorName} | Okuulib.kg`,
    description: book.description?.slice(0, 160) || `${book.title} китебин онлайн окуу`,
    openGraph: {
      title: `${book.title} — ${authorName}`,
      description: book.description?.slice(0, 160),
      images: [{ url: cover, width: 800, height: 1200, alt: book.title }],
    },
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    notFound();
  }

  const coverUrl = getCoverUrl(book);
  const chapters = book.chapters || [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 pb-16">
      {/* Book Main Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm">
        {/* Cover Column */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center">
          <div className="relative aspect-[2/3] w-48 sm:w-56 md:w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-800">
            <Image
              src={coverUrl}
              alt={book.title}
              fill
              priority
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        {/* Info Column */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Genre Tags */}
            {book.genres && book.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {book.genres.map((g) => (
                  <Badge key={g.id} variant="brand">
                    {g.name}
                  </Badge>
                ))}
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1A1A2E] dark:text-white leading-tight">
              {book.title}
            </h1>

            {book.author && (
              <div className="flex items-center gap-2 text-sm sm:text-base text-[#6B7280] dark:text-gray-300">
                <User className="h-4 w-4 text-[#E84326]" />
                <Link
                  href={`/authors/${book.author.id}`}
                  className="font-bold text-[#1A1A2E] dark:text-gray-100 hover:text-[#E84326] transition-colors"
                >
                  {book.author.name}
                </Link>
              </div>
            )}

            {book.description && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-gray-400 mb-2">
                  Чыгарманын баяндамасы
                </h3>
                <p className="text-sm text-[#1A1A2E] dark:text-gray-200 leading-relaxed max-w-3xl whitespace-pre-line font-normal">
                  {book.description}
                </p>
              </div>
            )}
          </div>

          {/* Actions CTA */}
          <div className="flex flex-wrap items-center gap-3.5 border-t border-gray-100 dark:border-gray-800 pt-6">
            <Link href={`/reader/${book.workId}`}>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-[#E84326] px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-brand-500/25 transition-all hover:bg-[#D63A20] active:scale-95">
                <BookOpen className="h-5 w-5" />
                <span>Окууну баштоо</span>
              </button>
            </Link>

            <Link href={`/aitu?book=${encodeURIComponent(book.title)}`}>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-5 py-3.5 text-sm font-bold text-[#1A1A2E] dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-750 active:scale-95 transition-all">
                <Sparkles className="h-4 w-4 text-[#E84326]" />
                <span>Aitu менен талкуулоо</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Chapters (Table of Contents) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E84326]">
          <ListOrdered className="h-4 w-4" />
          <span>Мазмуну жана бөлүмдөрү</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1A2E] dark:text-white">
          Китептин бөлүмдөрү ({chapters.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {chapters.map((ch, idx) => (
            <Link
              key={ch.chapterNumber}
              href={`/reader/${book.workId}?chapter=${idx}`}
              className="group flex items-center justify-between rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-all hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-xs"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6] dark:bg-gray-800 text-xs font-bold text-[#1A1A2E] dark:text-white group-hover:bg-[#E84326] group-hover:text-white transition-colors">
                  {idx + 1}
                </div>
                <span className="text-sm font-bold text-[#1A1A2E] dark:text-gray-200 group-hover:text-[#E84326] truncate">
                  {ch.chapterTitle || `${idx + 1}-бөлүм`}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#E84326] transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* Other works by author */}
      {book.otherWorks && book.otherWorks.length > 0 && (
        <section className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-8">
          <h2 className="text-xl font-extrabold text-[#1A1A2E] dark:text-white">
            Автордун башка чыгармалары
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {book.otherWorks.map((other) => (
              <BookCard key={other.id} book={other as unknown as WorkResponse} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
