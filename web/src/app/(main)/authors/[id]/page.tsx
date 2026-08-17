import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { User, BookOpen, ExternalLink, Calendar } from "lucide-react";
import { AuthorFullResponse } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8082";

async function getAuthor(id: string): Promise<AuthorFullResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/authors/${id}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as AuthorFullResponse;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const author = await getAuthor(id);

  if (!author) {
    return { title: "Автор табылган жок" };
  }

  return {
    title: `${author.name} — Өмүр баяны жана чыгармалары`,
    description: author.bio ? author.bio.slice(0, 160) : `${author.name} чыгармалары Okuulib китепканасында`,
  };
}

export default async function AuthorPage({ params }: Props) {
  const { id } = await params;
  const author = await getAuthor(id);

  if (!author) {
    notFound();
  }

  const works = author.works || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      {/* Author Profile Banner */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-2 border-brand-500 bg-zinc-800 shadow-xl">
            {author.profilePhotoUrl ? (
              <Image
                src={author.profilePhotoUrl}
                alt={author.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-400">
                <User className="h-16 w-16" />
              </div>
            )}
          </div>

          <div className="space-y-3 text-center sm:text-left flex-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              {author.name}
            </h1>

            {author.dateOfBirth && (
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-zinc-400">
                <Calendar className="h-4 w-4 text-brand-500" />
                <span>Туулган жылы: {author.dateOfBirth}</span>
              </div>
            )}

            {author.bio && (
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line max-w-3xl pt-2">
                {author.bio}
              </p>
            )}

            {author.wiki && (
              <a
                href={author.wiki}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 hover:underline pt-2"
              >
                <span>Википедиядан кененирээк маалымат</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Author Works List */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-500">
          <BookOpen className="h-4 w-4" />
          <span>Автордун чыгармалары</span>
        </div>
        <h2 className="text-2xl font-bold text-white">
          Жарыяланган китептери ({works.length})
        </h2>

        {works.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {works.map((w) => (
              <Link
                key={w.id}
                href={`/books/${w.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-zinc-700 hover:bg-zinc-800/40 transition-all shadow-md"
              >
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors">
                    {w.title}
                  </h3>
                  {w.description && (
                    <p className="mt-2 text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {w.description}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3 text-xs font-semibold text-brand-500">
                  <span>Окуу</span>
                  <BookOpen className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-500 text-sm">
            Бул автордун китептери азырынча жүктөлө элек.
          </div>
        )}
      </section>
    </div>
  );
}
