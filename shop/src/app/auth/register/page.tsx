"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Ошибка регистрации");
      router.push("/auth/login");
    } catch (e: any) {
      setErr(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Регистрация</h1>

      {err && (
        <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm">
          {err}
        </div>
      )}

      <div className="mt-6 grid gap-3">
        <input
          className="rounded-xl border p-2"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="rounded-xl border p-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="rounded-xl border p-2"
          placeholder="Пароль (мин 6)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={loading}
          onClick={submit}
        >
          {loading ? "Создаём..." : "Создать аккаунт"}
        </button>

        <p className="text-sm text-gray-600">
          Уже есть аккаунт?{" "}
          <Link className="underline" href="/auth/login">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
