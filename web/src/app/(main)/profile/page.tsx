"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Mail, Shield, LogOut, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { authApi } from "@/lib/api";
import { UserDTO } from "@/types";

export default function ProfilePage() {
  const { user, isAuthenticated, logout, isHydrated, setUser } = useAuthStore();
  const { t } = useLanguageStore();
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
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-[#E84326] shadow-sm">
          <User className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-extrabold text-[#1A1A2E] dark:text-white">
          {t.profile.loginPrompt}
        </h2>
        <p className="text-sm text-[#6B7280] dark:text-gray-400">
          {t.profile.loginPromptDesc}
        </p>
        <div className="pt-2">
          <Link href="/login">
            <button className="rounded-2xl bg-[#E84326] px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-brand-500/25 hover:bg-[#D63A20] active:scale-95 transition-all">
              {t.profile.loginPrompt}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const currentUser = profileData || user;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A2E] dark:text-white">
          {t.profile.title}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#6B7280] dark:text-gray-400">
          {t.profile.subtitle}
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#E84326]" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* User Card */}
          <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#D63A20] to-[#E84326] text-white shadow-md shadow-brand-500/20">
                <User className="h-10 w-10 sm:h-12 sm:w-12" />
              </div>

              <div className="space-y-4 text-center sm:text-left flex-1">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1A2E] dark:text-white">
                    {currentUser?.username}
                  </h2>
                  <p className="text-xs font-bold text-[#E84326] mt-0.5">
                    {t.profile.readerRole}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center gap-3 rounded-2xl bg-[#F3F4F6] dark:bg-gray-800 p-3 text-xs">
                    <Mail className="h-4 w-4 text-[#E84326]" />
                    <div>
                      <p className="text-gray-400">{t.profile.email}</p>
                      <p className="font-bold text-[#1A1A2E] dark:text-white">
                        {currentUser?.email || t.profile.notSpecified}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-[#F3F4F6] dark:bg-gray-800 p-3 text-xs">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="text-gray-400">{t.profile.security}</p>
                      <p className="font-bold text-[#1A1A2E] dark:text-white">{t.profile.jwtProtected}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-center sm:justify-start">
                  <button
                    onClick={() => logout()}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t.profile.logout}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
