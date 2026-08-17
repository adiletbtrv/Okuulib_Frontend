"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Lock, User, AlertCircle } from "lucide-react";
import { authApi } from "../../../lib/api";
import { useAuthStore } from "../../../store/useAuthStore";
import { useLanguageStore } from "../../../store/useLanguageStore";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { t } = useLanguageStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError(t.auth.fillAllFields);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await authApi.login({
        username: username.trim(),
        password: password.trim(),
      });
      login(data, { username: username.trim() });
      router.push("/");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr.response?.data?.message || "Логин же сырсөз туура эмес. Кайра текшериңиз."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-xl shadow-gray-200/50 dark:shadow-none space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-[#1A1A2E] dark:text-white">{t.auth.welcomeBack}</h1>
        <p className="text-xs text-[#6B7280] dark:text-gray-400">
          {t.auth.welcomeBackDesc}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#1A1A2E] dark:text-gray-200">
            {t.auth.username}
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              placeholder="Username"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#1A1A2E] dark:text-gray-200">
            {t.auth.password}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={loading}
        >
          <LogIn className="h-4 w-4" />
          <span>{t.auth.loginBtn}</span>
        </Button>
      </form>

      <div className="text-center text-xs text-[#6B7280] dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
        <span>{t.auth.noAccount} </span>
        <Link href="/register" className="font-bold text-[#E84326] hover:underline">
          {t.auth.registerLink}
        </Link>
      </div>
    </div>
  );
}
