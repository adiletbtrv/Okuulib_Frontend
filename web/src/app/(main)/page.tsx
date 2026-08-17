"use client";

import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { useWorks, useGenres } from "../../hooks/useBooks";
import { Button } from "../../components/ui/Button";
import { Card, Badge } from "../../components/ui/Card";
import { getCoverUrl } from "../../types";

export default function HomePage() {
  const { data: worksData, isLoading: isWorksLoading } = useWorks({ size: 8 });
  const { data: genres } = useGenres();

  const works = worksData?.content || [];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 via-zinc-950 to-zinc-950 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1 text-xs font-semibold text-brand-400 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Кыргыз адабиятынын санарип платформасы</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
                Кыргыз адабиятын{" "}
                <span className="bg-gradient-to-r from-brand-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                  жаңы деңгээлде
                </span>{" "}
                окуңуз
              </h1>

              <p className="max-w-2xl text-base sm:text-lg text-zinc-400 leading-relaxed mx-auto lg:mx-0">
                «Манас» эпосунан заманбап повесттерге чейин: бардык китептер
                акылдуу веб-читка, 4 ыңгайлуу түс темасы жана ИИ-ассистент Aitu менен
                бирге бир платформада.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link href="/catalog" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full gap-2 text-base">
                    <BookOpen className="h-5 w-5" />
                    <span>Китепканага өтүү</span>
                  </Button>
                </Link>
                <Link href="/aitu" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full gap-2 text-base border-zinc-700">
                    <Sparkles className="h-5 w-5 text-brand-500" />
                    <span>Aitu AI менен сүйлөшүү</span>
                  </Button>
                </Link>
              </div>

              {/* Fast Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="text-2xl font-bold text-white">500+</p>
                  <p className="text-xs text-zinc-400">Китептер</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">120+</p>
                  <p className="text-xs text-zinc-400">Авторлор</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-500">100%</p>
                  <p className="text-xs text-zinc-400">Акысыз</p>
                </div>
              </div>
            </div>

            {/* Right Showcase Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-xl shadow-2xl shadow-black/80">
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <div className="h-3 w-3 rounded-full bg-red-500/80" />
                      <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-400">
                      Okuulib Reader Preview
                    </span>
                  </div>

                  <div className="mt-5 space-y-4 font-serif text-sm text-zinc-300 leading-relaxed">
                    <div className="inline-block rounded-md bg-brand-500/20 px-2 py-0.5 text-xs font-sans font-semibold text-brand-400">
                      Үзүндү: «Биринчи мугалим»
                    </div>
                    <p className="italic text-zinc-200">
                      «Айылдын үстүндөгү бийик дөңдө эки чоң терек өсөт. Алар күнү-түнү
                      шамалдын ыргагы менен шыбырашып, алыскы сапардагы жолоочуларга
                      багыт берип турат…»
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs font-sans text-zinc-400">
                      <span>Чыңгыз Айтматов</span>
                      <span className="text-brand-500 font-semibold">1-бөлүм</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Books Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-500 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span>Сунушталган китептер</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Популярдуу чыгармалар
            </h2>
          </div>
          <Link
            href="/catalog"
            className="flex items-center gap-1 text-sm font-semibold text-brand-500 hover:text-brand-400 transition-colors"
          >
            <span>Баарын көрүү</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isWorksLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl bg-zinc-900 border border-zinc-800"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {works.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3 transition-all hover:border-zinc-700 hover:shadow-xl hover:shadow-black/60"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-800">
                  <Image
                    src={getCoverUrl(book)}
                    alt={book.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-xs font-semibold text-white flex items-center gap-1">
                      Окуу <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 group-hover:text-brand-500 transition-colors line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                      {book.authorName || "Белгисиз автор"}
                    </p>
                  </div>

                  {book.genres && book.genres.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 font-medium">
                        {book.genres[0].name}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Genre Explorer */}
      {genres && genres.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-500 mb-1">
              <Compass className="h-4 w-4" />
              <span>Жанрлар боюнча бөлүштүрүү</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Кызыккан жанрды тандаңыз
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {genres.map((g) => (
              <Link
                key={g.id}
                href={`/catalog?genre=${g.id}`}
                className="group flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-center transition-all hover:border-brand-500/40 hover:bg-brand-500/10 hover:shadow-lg"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 group-hover:bg-brand-500 group-hover:text-white transition-colors mb-2 text-zinc-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-zinc-200 group-hover:text-brand-400 transition-colors">
                  {g.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Aitu AI Feature Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-brand-500/30 bg-gradient-to-r from-zinc-900 via-zinc-900 to-brand-950/40 p-8 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8 space-y-4">
              <Badge variant="brand">Aitu AI Интеграциясы</Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Кыргыз адабиятынын жасалма интеллект жардамчысы
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
                Aitu — чыгармалардын терең маанисин, каармандардын психологиясын,
                эпостордун тарыхый негиздерин заматта түшүндүрүп бере алат.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Толук тексттик контекст талдоо</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Реалдуу убакыттагы жооптор</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <Link href="/aitu">
                <Button variant="primary" size="lg" className="gap-2 shadow-xl">
                  <Sparkles className="h-5 w-5" />
                  <span>Aitu менен баштоо</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
