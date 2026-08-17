"use client";

import Link from "next/link";
import { BookOpen, Heart } from "lucide-react";
import { useLanguageStore } from "../../store/useLanguageStore";

export function Footer() {
  const { t } = useLanguageStore();

  return (
    <footer className="border-t border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 pt-12 pb-20 md:pb-12 text-[#6B7280] dark:text-gray-400 transition-colors duration-150">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E84326] text-white shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-[#1A1A2E] dark:text-white">
                Okuulib<span className="text-[#E84326]">.kg</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
              {t.home.heroDesc}
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A2E] dark:text-white">
              {t.nav.catalog}
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/" className="hover:text-[#E84326] transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-[#E84326] transition-colors">
                  {t.nav.catalog}
                </Link>
              </li>
              <li>
                <Link href="/aitu" className="hover:text-[#E84326] transition-colors">
                  {t.nav.aitu}
                </Link>
              </li>
              <li>
                <Link href="/bookmarks" className="hover:text-[#E84326] transition-colors">
                  {t.nav.bookmarks}
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A2E] dark:text-white">
              {t.aitu.title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {t.home.aituBannerDesc}
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Okuulib.kg. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with passion for literature</span>
            <Heart className="h-3.5 w-3.5 text-[#E84326] fill-[#E84326]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
