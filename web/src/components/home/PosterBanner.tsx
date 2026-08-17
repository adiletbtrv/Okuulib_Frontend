"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { useLanguageStore } from "../../store/useLanguageStore";

interface PosterBannerProps {
  title: string;
  description: string;
  image: string;
  link: string;
}

export function PosterBanner({
  title,
  description,
  image,
  link,
}: PosterBannerProps) {
  const { t } = useLanguageStore();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#E84326] to-[#D63A20] p-6 sm:p-8 lg:p-10 shadow-lg text-white transition-all duration-300 hover:shadow-brand">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Text Content */}
        <div className="md:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{t.home.heroBadge}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            {title}
          </h2>

          <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-xl line-clamp-3 font-medium">
            {description}
          </p>

          <div className="pt-2">
            <Link href={link}>
              <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#E84326] shadow-md transition-all duration-150 hover:bg-white/90 hover:shadow-lg active:scale-95">
                <span>{t.home.startReading}</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Right 3D Angled Book Poster */}
        <div className="md:col-span-4 flex justify-center md:justify-end">
          <div className="relative aspect-[2/3] w-36 sm:w-44 lg:w-48 -rotate-4 rounded-2xl overflow-hidden shadow-2xl border border-white/20 transition-transform duration-300 hover:rotate-0 hover:scale-105">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  );
}
