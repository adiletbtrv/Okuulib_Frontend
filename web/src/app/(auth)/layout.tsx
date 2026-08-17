import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] px-4 py-12">
      <Link href="/" className="flex items-center gap-3 mb-8 group">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#D63A20] to-[#E84326] shadow-md shadow-brand-500/25 transition-transform group-hover:scale-105">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-extrabold tracking-tight text-[#1A1A2E]">
          Okuulib<span className="text-[#E84326]">.kg</span>
        </span>
      </Link>

      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
