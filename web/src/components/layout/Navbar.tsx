"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Search,
  Sparkles,
  Bookmark,
  User,
  LogIn,
  Library,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { SearchModal } from "./SearchModal";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isHydrated } = useAuthStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Global shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const NAV_LINKS = [
    { label: "Башкы", href: "/" },
    { label: "Китепкана", href: "/catalog" },
    { label: "Aitu AI", href: "/aitu", badge: "ИИ" },
    { label: "Сакталгандар", href: "/bookmarks" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#D63A20] to-[#E84326] text-white shadow-md shadow-brand-500/20 transition-transform group-hover:scale-105">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-[#1A1A2E]">
                  Okuulib<span className="text-[#E84326]">.kg</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-[#E84326]/10 text-[#E84326]"
                        : "text-[#6B7280] hover:bg-gray-100 hover:text-[#1A1A2E]"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="rounded-full bg-[#E84326] px-1.5 py-0.2 text-[10px] font-bold text-white uppercase tracking-wider">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Search Trigger & User Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 rounded-full border border-gray-200/80 bg-[#F3F4F6] px-3.5 py-2 text-xs font-medium text-[#6B7280] hover:border-gray-300 hover:bg-gray-200/60 transition-all shadow-2xs"
            >
              <Search className="h-4 w-4 text-[#9CA3AF]" />
              <span className="hidden sm:inline">Китеп же автор издөө…</span>
              <kbd className="hidden sm:inline-flex items-center rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold text-gray-500 border border-gray-200">
                ⌘K
              </kbd>
            </button>

            {/* User Profile / Login */}
            {isHydrated && isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen((p) => !p)}
                  className="flex items-center gap-2 rounded-full bg-gray-100 p-1.5 pr-3 text-xs font-bold text-[#1A1A2E] hover:bg-gray-200/70 transition-colors border border-gray-200"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E84326] text-white">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="max-w-[100px] truncate">
                    {user?.username || "Окурман"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#1A1A2E]"
                    >
                      <User className="h-4 w-4 text-gray-400" />
                      <span>Жеке кабинет</span>
                    </Link>
                    <Link
                      href="/bookmarks"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#1A1A2E]"
                    >
                      <Bookmark className="h-4 w-4 text-gray-400" />
                      <span>Сакталгандар</span>
                    </Link>
                    <div className="my-1 border-t border-gray-100" />
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Чыгуу</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <button className="flex items-center gap-1.5 rounded-xl bg-[#E84326] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#D63A20] active:scale-95 transition-all">
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Кирүү</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
