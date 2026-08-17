"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Lock, User, AlertCircle } from "lucide-react";
import { authApi } from "../../../lib/api";
import { useAuthStore } from "../../../store/useAuthStore";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Логин жана сырсөздү киргизиңиз.");
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
    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Кайра кош келиңиз</h1>
        <p className="text-xs text-[#6B7280]">
          Окууну улантуу үчүн аккаунтуңузга кириңиз
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#1A1A2E]">
            Колдонуучу аты (Логин)
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
          <label className="text-xs font-bold text-[#1A1A2E]">
            Сырсөз
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
          <span>Кирүү</span>
        </Button>
      </form>

      <div className="text-center text-xs text-[#6B7280] border-t border-gray-100 pt-4">
        <span>Аккаунтуңуз жокпу? </span>
        <Link href="/register" className="font-bold text-[#E84326] hover:underline">
          Катталуу
        </Link>
      </div>
    </div>
  );
}
