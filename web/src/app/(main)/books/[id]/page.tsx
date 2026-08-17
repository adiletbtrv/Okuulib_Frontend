import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  User,
  ListOrdered,
  Bookmark,
  Share2,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { WorkResponse, getCoverUrl } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Card";

interface Props {
  params: Promise<{ id: string }>;
}

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8082";

async function getBook(id: string): Promise<WorkResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/works/${id}`, {
      next: { revalidate: 300 },
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
    title: `${book.title} — ${authorName}`,
    description: book.description
      ? book.description.slice(0, 160)
      : `«${book.title}» чыгармасын Okuulib платформасынан онлайн окуңуз.`,
    openGraph: {
      title: `${book.title} — ${authorName}`,
      description: book.description ? book.description.slice(0, 160) : "",
      images: [
        {
          url: cover,
          width: 800,
          height: 1200,
          alt: book.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${book.title} — ${authorName}`,
      description: book.description ? book.description.slice(0, 160) : "",
      images: [cover],
    },
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    notFound();
  }

  const chapters = book.chapters || [];
  const coverUrl = getCoverUrl(book);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      {/* Book Header Card */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
        {/* Cover Column */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center">
          <div className="relative aspect-[2/3] w-56 md:w-full overflow-hidden rounded-2xl bg-zinc-800 shadow-2xl shadow-black/80 border border-zinc-700/50">
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

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {book.title}
            </h1>

            {book.author && (
              <div className="flex items-center gap-2 text-base text-zinc-300">
                <User className="h-4 w-4 text-brand-500" />
                <Link
                  href={`/authors/${book.author.id}`}
                  className="font-semibold text-zinc-200 hover:text-brand-400 hover:underline transition-colors"
                >
                  {book.author.name}
                </Link>
              </div>
            )}

            {book.description && (
              <div className="border-t border-zinc-800 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Чыгарманын баяндамасы
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl whitespace-pre-line">
                  {book.description}
                </p>
              </div>
            )}
          </div>

          {/* Actions CTA */}
          <div className="flex flex-wrap items-center gap-3.5 border-t border-zinc-800 pt-6">
            <Link href={`/reader/${book.workId}`}>
              <Button variant="primary" size="lg" className="gap-2 shadow-xl shadow-brand-500/25">
                <BookOpen className="h-5 w-5" />
                <span>Окууну баштоо</span>
              </Button>
            </Link>

            <Link href={`/aitu?book=${encodeURIComponent(book.title)}`}>
              <Button variant="secondary" size="lg" className="gap-2 border-zinc-700">
                <Sparkles className="h-5 w-5 text-brand-500" />
                <span>Aitu менен талкуулоо</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Chapters (Table of Contents) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-500">
          <ListOrdered className="h-4 w-4" />
          <span>Мазмуну жана бөлүмдөрү</span>
        </div>
        <h2 className="text-2xl font-bold text-white">
          Китептин бөлүмдөрү ({chapters.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {chapters.map((ch, idx) => (
            <Link
              key={ch.chapterNumber}
              href={`/reader/${book.workId}?chapter=${idx}`}
              className="group flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-800/60"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                  {idx + 1}
                </div>
                <span className="text-sm font-semibold text-zinc-200 group-hover:text-white truncate">
                  {ch.chapterTitle || `${idx + 1}-бөлүм`}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-brand-500 transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* Other works by author */}
      {book.otherWorks && book.otherWorks.length > 0 && (
        <section className="space-y-4 border-t border-zinc-800 pt-8">
          <h2 className="text-xl font-bold text-white">
            Автордун башка чыгармалары
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {book.otherWorks.map((other) => (
              <Link
                key={other.id}
                href={`/books/${other.id}`}
                className="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 hover:border-zinc-700 transition-all"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-800 mb-2">
                  <Image
                    src={other.coverUrl || "/images/default-cover.png"}
                    alt={other.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    unoptimized
                  />
                </div>
                <h4 className="text-xs font-bold text-zinc-200 group-hover:text-brand-400 truncate">
                  {other.title}
                </h4>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
