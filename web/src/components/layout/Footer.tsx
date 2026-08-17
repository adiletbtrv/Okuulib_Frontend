import Link from "next/link";
import { BookOpen, Github, Heart, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Okuulib <span className="text-brand-500">.kg</span>
              </span>
            </Link>
            <p className="max-w-md text-sm text-zinc-400 leading-relaxed">
              Кыргыз элинин бай адабий мурасын, классикалык жана заманбап чыгармаларын
              санариптештирүү жана жасалма интеллект аркылуу жеткиликтүү кылуу платформасы.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Spring Boot 3 + Next.js 15 + Aitu AI Engine</span>
            </div>
          </div>

          {/* Nav Col 1 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-3">
              Бөлүмдөр
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/catalog" className="hover:text-white transition-colors">
                  Бардык китептер
                </Link>
              </li>
              <li>
                <Link href="/catalog?genre=1" className="hover:text-white transition-colors">
                  Эпостор жана дастандар
                </Link>
              </li>
              <li>
                <Link href="/aitu" className="hover:text-white transition-colors flex items-center gap-1.5 text-brand-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  Aitu AI жардамчысы
                </Link>
              </li>
              <li>
                <Link href="/bookmarks" className="hover:text-white transition-colors">
                  Менин сакталгандарым
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Social */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-3">
              Маалымат
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-zinc-500">Версия: v1.2 Production</span>
              </li>
              <li>
                <a
                  href="https://github.com/adiletbtrv/Okuulib_Frontend"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Github className="h-4 w-4" />
                  GitHub Repository
                </a>
              </li>
              <li>
                <span className="text-xs text-zinc-500">
                  Бардык укуктар корголгон © {new Date().getFullYear()}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} Okuulib. Кыргыз Республикасы.</p>
          <p className="flex items-center gap-1">
            Кыргыз тили жана маданияты үчүн <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 inline" /> менен жасалды.
          </p>
        </div>
      </div>
    </footer>
  );
}
