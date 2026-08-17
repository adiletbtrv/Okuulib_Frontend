"use client";

import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { useWorks, useGenres } from "@/hooks/useBooks";
import { PosterBanner } from "@/components/home/PosterBanner";
import { BookCard } from "@/components/books/BookCard";
import { getCoverUrl } from "@/types";

export default function HomePage() {
  const { data: worksData, isLoading: isWorksLoading } = useWorks({ size: 16 });
  const { data: genres } = useGenres();

  const works = worksData?.content || [];
  const featuredBook = works[0];
  const bestCollections = works.slice(0, 6);
  const recommended = works.slice(6, 12);
  const classics = works.slice(12, 16);

  return (
    <div className="space-y-12 pb-16">
      {/* Top Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        {/* Hero Poster Banner */}
        {featuredBook ? (
          <PosterBanner
            title={featuredBook.title}
            description={
              featuredBook.description ||
              "Кыргыз адабиятынын алтын казынасындагы эң көрүнүктүү жана терең маанилүү чыгармалардын бири."
            }
            image={getCoverUrl(featuredBook)}
            link={`/books/${featuredBook.id}`}
          />
        ) : (
          <PosterBanner
            title="«Манас» эпосу"
            description="Кыргыз элинин баатырдык улуу дастаны, дүйнөлүк маданий мурастын туу чокусу."
            image="/images/default-cover.png"
            link="/catalog"
          />
        )}
      </div>

      {/* Best Collections (Эң мыкты жыйнактар) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E84326] mb-1">
              <TrendingUp className="h-4 w-4" />
              <span>Тандалма чыгармалар</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1A1A2E]">
              Эң мыкты жыйнактар
            </h2>
          </div>
          <Link
            href="/catalog"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#E84326] hover:text-[#D63A20] transition-colors"
          >
            <span>Баарын көрүү</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isWorksLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] animate-pulse rounded-xl bg-gray-200"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {bestCollections.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* Recommended Section (Сунушталгандар) */}
      {recommended.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E84326] mb-1">
                <BookOpen className="h-4 w-4" />
                <span>Окурмандардын тандоосу</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1A1A2E]">
                Сунушталган китептер
              </h2>
            </div>
            <Link
              href="/catalog"
              className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#E84326] hover:text-[#D63A20] transition-colors"
            >
              <span>Баарын көрүү</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {recommended.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* Genre Explorer */}
      {genres && genres.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E84326] mb-1">
              <Compass className="h-4 w-4" />
              <span>Категориялар</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1A1A2E]">
              Жанрлар боюнча тандоо
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {genres.map((g) => (
              <Link
                key={g.id}
                href={`/catalog?genre=${g.id}`}
                className="group flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#E84326]/30 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E84326]/10 text-[#E84326] group-hover:bg-[#E84326] group-hover:text-white transition-colors mb-2">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-[#1A1A2E] group-hover:text-[#E84326] transition-colors">
                  {g.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Aitu AI Feature Promo Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-r from-orange-50/80 via-white to-orange-50/50 p-8 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E84326]/10 px-3 py-1 text-xs font-bold text-[#E84326]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Aitu AI Жасалма интеллект</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E]">
                Кыргыз адабиятынын акылдуу жардамчысы
              </h2>
              <p className="text-sm text-[#6B7280] max-w-2xl leading-relaxed">
                Aitu — каалаган чыгарманын идеясын, каармандарынын образын жана
                тарыхый мазмунун кыргыз тилинде заматта түшүндүрүп берет.
              </p>
              <div className="flex flex-wrap gap-4 pt-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1A2E]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Текстти терең талдоо</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1A2E]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Реалдуу убакытта баарлашуу</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Link href="/aitu">
                <button className="inline-flex items-center gap-2 rounded-2xl bg-[#E84326] px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-brand-500/25 transition-all hover:bg-[#D63A20] active:scale-95">
                  <Sparkles className="h-4 w-4" />
                  <span>Aitu менен сүйлөшүү</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
