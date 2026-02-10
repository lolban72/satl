"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setErr(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!res?.ok) {
      setErr("Неверный email или пароль");
      return;
    }

    router.refresh();
  router.push("/account");


    router.push("/account");
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Вход</h1>

      {err && (
        <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm">
          {err}
        </div>
      )}

      <div className="mt-6 grid gap-3">
        <input
          className="rounded-xl border p-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="rounded-xl border p-2"
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={loading}
          onClick={submit}
        >
          {loading ? "Входим..." : "Войти"}
        </button>

        <p className="text-sm text-gray-600">
          Нет аккаунта?{" "}
          <Link className="underline" href="/auth/register">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
