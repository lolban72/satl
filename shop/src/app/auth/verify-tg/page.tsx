"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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

  const botLink = useMemo(() => {
    return (process.env.NEXT_PUBLIC_TG_BOT_URL || "").trim();
  }, []);

  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copyOk, setCopyOk] = useState<string | null>(null);

  const [err, setErr] = useState<string | null>(null);

  async function generateCode() {
    setErr(null);
    setCopyOk(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/tg-link-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Не удалось сгенерировать код");

      setCode(String(data?.code || ""));
    } catch (e: any) {
      setErr(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!code) return;
    setCopyOk(null);
    try {
      await navigator.clipboard.writeText(code);
      setCopyOk("Скопировано ✅");
      setTimeout(() => setCopyOk(null), 1200);
    } catch {
      setCopyOk("Не удалось скопировать");
      setTimeout(() => setCopyOk(null), 1200);
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
            1) Нажмите <b>Сгенерировать код</b> на сайте<br />
            2) Откройте Telegram-бота<br />
            3) Отправьте код боту одним сообщением — аккаунт привяжется автоматически ✅
          </div>

          <div className="mt-[14px] grid gap-10">
            <button
              onClick={generateCode}
              disabled={loading}
              className={[
                "h-[35px] w-full bg-black text-white",
                "text-[9px] font-bold uppercase tracking-[0.12em]",
                "hover:bg-black/85 transition active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              {loading ? "ГЕНЕРИРУЮ..." : "Сгенерировать код"}
            </button>

            <div>
              <Label>Ваш код</Label>
              <div className="flex gap-2">
                <Input
                  value={code}
                  readOnly
                  placeholder="Сначала сгенерируйте код"
                  hasError={!!err}
                />
                <button
                  type="button"
                  onClick={copy}
                  disabled={!code}
                  className={[
                    "h-[35px] px-3 border text-[9px] font-bold uppercase tracking-[0.12em]",
                    "transition",
                    code ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed",
                  ].join(" ")}
                >
                  Copy
                </button>
              </div>
              {copyOk ? (
                <div className="mt-2 text-[10px] text-black/55">{copyOk}</div>
              ) : null}
            </div>

            <a
              href={botLink || "#"}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!botLink}
              className={[
                "inline-flex h-[35px] w-full items-center justify-center",
                "bg-black text-white text-[9px] font-bold uppercase tracking-[0.12em]",
                "transition",
                botLink ? "hover:bg-black/85" : "opacity-50 pointer-events-none",
              ].join(" ")}
            >
              Открыть Telegram-бота
            </a>
          </div>

          {err ? (
            <div className="mt-[14px] rounded-md border border-red-200 bg-red-50 p-3 text-[11px] text-red-700">
              {err}
            </div>
          ) : null}

          <div className="mt-[14px] flex items-center justify-between">
            <Link
              href="/"
              className="text-[8px] uppercase tracking-[0.08em] text-black/45 hover:text-black/70 transition"
            >
              На главную
            </Link>

            <button
              type="button"
              onClick={() => {
                router.push("/account/profile");
                router.refresh();
              }}
              className="text-[8px] uppercase tracking-[0.08em] text-black/45 hover:text-black/70 transition"
            >
              В профиль →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}