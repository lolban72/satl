"use client";

import { useState } from "react";

export default function SubscriptionsClient({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function toggle(next: boolean) {
    setEnabled(next); // optimistic
    setSaving(true);
    setOk(null);
    setErr(null);

    try {
      const res = await fetch("/api/account/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletterEnabled: next }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Не удалось сохранить");

      setOk(next ? "Подписка включена ✅" : "Подписка выключена ✅");
    } catch (e: any) {
      setErr(e?.message || "Ошибка");
      setEnabled(!next); // rollback
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="text-center font-semibold italic text-[20px] text-black">
        Подписки
      </div>

      <div className="mt-[18px] flex flex-col items-center gap-[10px]">
        <div className="text-[13px] text-black/70 text-center max-w-[520px]">
          Включите рассылку, чтобы получать новости о новых товарах, скидках и релизах.
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() => toggle(!enabled)}
          className={[
            "mt-[10px] h-[30px] w-[330px] border border-black/15",
            "flex items-center justify-between px-[12px]",
            "text-[10px] font-bold uppercase tracking-[0.12em]",
            "transition hover:border-black/40 disabled:opacity-40 disabled:cursor-not-allowed",
          ].join(" ")}
        >
          <span>Рассылка</span>

          {/* switch */}
          <span
            className={[
              "relative inline-flex h-[18px] w-[36px] items-center",
              "border border-black/20",
              enabled ? "bg-black" : "bg-white",
              "transition",
            ].join(" ")}
            aria-hidden="true"
          >
            <span
              className={[
                "absolute top-1/2 h-[12px] w-[12px] -translate-y-1/2",
                "bg-white border border-black/20 transition",
                enabled ? "left-[20px]" : "left-[4px]",
              ].join(" ")}
            />
          </span>
        </button>
      </div>
    </div>
  );
}
