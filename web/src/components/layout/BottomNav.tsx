"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Sparkles, Bookmark, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav in reader
  if (pathname?.startsWith("/reader")) return null;

  const NAV_ITEMS = [
    { label: "Башкы", href: "/", icon: Home },
    { label: "Китепкана", href: "/catalog", icon: Library },
    { label: "Aitu AI", href: "/aitu", icon: Sparkles, highlight: true },
    { label: "Сакталган", href: "/bookmarks", icon: Bookmark },
    { label: "Профиль", href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-gray-200/80 bg-white/95 px-2 backdrop-blur-lg md:hidden shadow-lg shadow-black/5">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors ${
              isActive
                ? "text-[#E84326] font-bold"
                : "text-[#9CA3AF] hover:text-[#1A1A2E]"
            }`}
          >
            <div className="relative">
              <Icon className={`h-5 w-5 ${item.highlight && isActive ? "animate-pulse" : ""}`} />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#E84326]" />
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
