"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-[6px] text-[8px] font-semibold uppercase tracking-[0.06em] text-black/60">
      {children}
    </div>
  );
}

function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }
) {
  const { hasError, className, ...rest } = props;
  return (
    <input
      {...rest}
      className={[
        "h-[35px] w-[330px] border px-[10px]",
        "text-[12px] font-semibold outline-none",
        "placeholder:text-black/35",
        "focus:border-black/40 transition",
        hasError ? "border-red-400" : "border-black/15",
        className ?? "",
      ].join(" ")}
    />
  );
}

export default function VerifyTgPage() {
  const router = useRouter();

  const [botLink, setBotLink] = useState<string>("");
  const [loadingLink, setLoadingLink] = useState(true);

  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // ✅ берём правильную ссылку на бота (deep-link /start <token>) с сервера
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingLink(true);
        const res = await fetch("/api/auth/tg-start-link", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data?.error || "Не удалось получить ссылку на бота");

        if (mounted) setBotLink(String(data?.url || ""));
      } catch (e: any) {
        if (mounted) {
          setBotLink(""); // покажем fallback-кнопку disabled
          setErr(e?.message || "Ошибка");
        }
      } finally {
        if (mounted) setLoadingLink(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    const c = code.trim();
    if (c.length < 4) {
      setErr("Введите код из Telegram (минимум 4 символа).");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/verify-tg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Не удалось подтвердить код");

      setOk("Аккаунт подтверждён ✅");
      router.push("/account/profile");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] px-[65px] pt-[70px] pb-[140px]">
      <div className="flex justify-center">
        <div className="w-[330px]">
          <div className="text-center text-[20px] font-semibold uppercase tracking-[-0.02em] text-black">
            ПОДТВЕРЖДЕНИЕ
          </div>

          <div className="mt-[10px] text-[10px] leading-[1.4] text-black/55">
            Перейдите в Telegram-бот, нажмите <b>Start</b>, получите код и введите его ниже.
          </div>

          <div className="mt-[12px]">
            <a
              href={botLink || "#"}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!botLink || loadingLink}
              className={[
                "inline-flex h-[35px] w-full items-center justify-center",
                "bg-black text-white text-[9px] font-bold uppercase tracking-[0.12em]",
                "transition",
                botLink && !loadingLink ? "hover:bg-black/85" : "opacity-50 pointer-events-none",
              ].join(" ")}
            >
              {loadingLink ? "ЗАГРУЖАЮ..." : "Открыть Telegram-бота"}
            </a>
          </div>

          {err ? (
            <div className="mt-[14px] rounded-md border border-red-200 bg-red-50 p-3 text-[11px] text-red-700">
              {err}
            </div>
          ) : null}

          {ok ? (
            <div className="mt-[14px] rounded-md border border-green-200 bg-green-50 p-3 text-[11px] text-green-700">
              {ok}
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-[18px]">
            <label className="block">
              <Label>Код из Telegram</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                hasError={!!err}
                placeholder="Например: 482913"
                inputMode="numeric"
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className={[
                "mt-[14px] h-[35px] w-[160px] bg-black text-white",
                "text-[9px] font-bold uppercase tracking-[0.12em]",
                "hover:bg-black/85 transition active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              {saving ? "ПРОВЕРЯЮ..." : "ПОДТВЕРДИТЬ"}
            </button>
          </form>

          <div className="mt-[14px]">
            <Link
              href="/"
              className="text-[8px] uppercase tracking-[0.08em] text-black/45 hover:text-black/70 transition"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
