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
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(1500),
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Author Profile Banner */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-full border-2 border-[#E84326] bg-gray-100 shadow-md">
            {author.profilePhotoUrl ? (
              <Image
                src={author.profilePhotoUrl}
                alt={author.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                <User className="h-14 w-14" />
              </div>
            )}
          </div>

          <div className="space-y-3 text-center sm:text-left flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E]">
              {author.name}
            </h1>

            {author.dateOfBirth && (
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-[#6B7280]">
                <Calendar className="h-4 w-4 text-[#E84326]" />
                <span>Туулган жылы: {author.dateOfBirth}</span>
              </div>
            )}

            {author.bio && (
              <p className="text-sm text-[#1A1A2E] leading-relaxed whitespace-pre-line max-w-3xl pt-1">
                {author.bio}
              </p>
            )}

            {author.wiki && (
              <a
                href={author.wiki}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#E84326] hover:underline pt-2"
              >
                <span>Википедиядан кененирээк маалымат</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Author Works List */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E84326]">
          <BookOpen className="h-4 w-4" />
          <span>Автордун китептери</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1A2E]">
          Жарыяланган чыгармалары ({works.length})
        </h2>

        {works.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {works.map((w) => (
              <Link
                key={w.id}
                href={`/books/${w.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 hover:border-gray-200 hover:shadow-md transition-all"
              >
                <div>
                  <h3 className="text-base font-bold text-[#1A1A2E] group-hover:text-[#E84326] transition-colors">
                    {w.title}
                  </h3>
                  {w.description && (
                    <p className="mt-2 text-xs text-[#6B7280] line-clamp-3 leading-relaxed">
                      {w.description}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-bold text-[#E84326]">
                  <span>Окуу</span>
                  <BookOpen className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 text-sm">
            Бул автордун китептери азырынча жүктөлө элек.
          </div>
        )}
      </section>
    </div>
  );
}
