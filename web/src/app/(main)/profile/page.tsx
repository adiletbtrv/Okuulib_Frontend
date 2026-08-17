"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Mail, Shield, BookOpen, LogOut, Loader2, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/lib/api";
import { UserDTO } from "@/types";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  const { user, isAuthenticated, logout, isHydrated, setUser } = useAuthStore();
  const [profileData, setProfileData] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      authApi
        .getCurrentUser()
        .then((u) => {
          setProfileData(u);
          setUser(u);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, setUser]);

  if (isHydrated && !isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-brand-500">
          <User className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Профилди көрүү үчүн кириңиз</h2>
        <p className="text-sm text-zinc-400">
          Жеке кабинетке кирүү үчүн аккаунтуңузга кириңиз же жаңы каттоодон өтүңүз.
        </p>
        <div className="pt-2">
          <Link href="/login">
            <Button variant="primary">Кирүү</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentUser = profileData || user;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Жеке кабинет
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Колдонуучунун маалыматтары жана коопсуздук параметрлери.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* User Card */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-brand-500 text-white shadow-xl shadow-brand-500/20">
                <User className="h-12 w-12" />
              </div>

              <div className="space-y-4 text-center sm:text-left flex-1">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {currentUser?.username}
                  </h2>
                  <p className="text-xs text-brand-400 font-semibold mt-0.5">
                    Okuulib Окурманы
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-3 rounded-xl bg-zinc-800/60 p-3 text-xs">
                    <Mail className="h-4 w-4 text-brand-500" />
                    <div>
                      <p className="text-zinc-500">Электрондук почта</p>
                      <p className="font-semibold text-zinc-200">
                        {currentUser?.email || "көрсөтүлгөн эмес"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-zinc-800/60 p-3 text-xs">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    <div>
                      <p className="text-zinc-500">Коопсуздук</p>
                      <p className="font-semibold text-zinc-200">JWT Корголгон</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-center sm:justify-start gap-3">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => logout()}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Чыгуу</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
