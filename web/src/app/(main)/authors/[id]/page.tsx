import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { User, BookOpen, ExternalLink, Calendar } from "lucide-react";
import { AuthorFullResponse } from "@/types";
import { MOCK_AUTHORS } from "@/lib/mockData";

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
    if (!res.ok) throw new Error("Not ok");
    return (await res.json()) as AuthorFullResponse;
  } catch {
    const numericId = Number(id);
    return MOCK_AUTHORS.find((a) => a.id === numericId) || MOCK_AUTHORS[0] || null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const author = await getAuthor(id);

  if (!author) {
    return { title: "Автор табылган жок" };
  }

  return {
    title: `${author.name} — Өмүр баяны жана чыгармалары | Okuulib.kg`,
    description: author.bio?.slice(0, 160) || `${author.name} кыргыз адабиятынын классиги`,
  };
}

export default async function AuthorPage({ params }: Props) {
  const { id } = await params;
  const author = await getAuthor(id);

  if (!author) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 pb-16">
      {/* Author Bio Header Card */}
      <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          {/* Avatar / Photo */}
          <div className="relative h-28 w-28 sm:h-36 sm:w-36 shrink-0 overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 shadow-md">
            {author.profilePhotoUrl ? (
              <Image
                src={author.profilePhotoUrl}
                alt={author.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-[#D63A20] to-[#E84326] text-white">
                <User className="h-12 w-12" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E84326]">
              Кыргыз адабиятынын автору
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A1A2E] dark:text-white">
              {author.name}
            </h1>

            {author.dateOfBirth && (
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#6B7280] dark:text-gray-400 font-medium">
                <Calendar className="h-3.5 w-3.5" />
                <span>Туулган жылы: {author.dateOfBirth}</span>
              </div>
            )}

            {author.bio && (
              <p className="text-sm text-[#1A1A2E] dark:text-gray-200 leading-relaxed font-normal pt-1">
                {author.bio}
              </p>
            )}

            {author.wiki && (
              <div className="pt-2">
                <a
                  href={author.wiki}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E84326] hover:underline"
                >
                  <span>Википедиядан кененирээк маалымат</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Author Works Grid */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E84326]">
          <BookOpen className="h-4 w-4" />
          <span>Китептери жана повесттери</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1A2E] dark:text-white">
          Жарыяланган чыгармалары
        </h2>

        {author.works && author.works.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {author.works.map((w) => (
              <Link
                key={w.id}
                href={`/books/${w.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs transition-all hover:border-[#E84326]/30 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-[#1A1A2E] dark:text-white group-hover:text-[#E84326] transition-colors">
                    {w.title}
                  </h3>
                  {w.description && (
                    <p className="text-xs text-[#6B7280] dark:text-gray-400 line-clamp-3 leading-relaxed">
                      {w.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
                  <span className="text-xs font-bold text-[#E84326]">Окуу</span>
                  <BookOpen className="h-4 w-4 text-gray-400 group-hover:text-[#E84326] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center text-xs text-gray-400">
            Бул автордун китептери азырынча жүктөлө элек.
          </div>
        )}
      </section>
    </div>
  );
}
