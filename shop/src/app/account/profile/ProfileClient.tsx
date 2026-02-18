"use client";

import { useState } from "react";
import { Title, Label, Input, PrimaryButton } from "../ui/Fields";
import ChangePasswordButton from "./ChangePasswordButton";

export default function ProfileClient({
  initialName,
  initialPhone,
  email,
}: {
  initialName: string;
  initialPhone: string;
  email: string;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);

  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setOk(null);
    setErr(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Не удалось сохранить");
      setOk("Сохранено ✅");
    } catch (e: any) {
      setErr(e?.message || "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full">
      <Title>Личные данные</Title>

      <div className="mt-[20px] flex flex-col items-center gap-[14px] px-[14px] sm:px-0">
        <div className="w-full max-w-[330px] flex flex-col gap-[14px]">
          <label className="block w-full">
            <Label>Имя</Label>
            <Input value={name} onChange={setName} />
          </label>

          <label className="block w-full">
            <Label>Телефон</Label>
            <Input value={phone} onChange={setPhone} />
          </label>

          <label className="block w-full">
            <Label>E-mail</Label>
            <input
              type="email"
              value={email}
              readOnly
              className="
                h-[35px] w-full
                border border-black/15 px-[10px]
                font-semibold text-[12px]
                outline-none
                bg-black/0 text-black/60
              "
            />
          </label>

          {/* Сохранить */}
          <div>
            <PrimaryButton
              disabled={saving}
              onClick={save}
              className="h-[35px] w-full"
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </PrimaryButton>
          </div>

          {ok ? <div className="text-[11px] text-black/70">{ok}</div> : null}
          {err ? <div className="text-[11px] text-[#B60404]">{err}</div> : null}

          {/* Выход — мобилка */}
          <form action="/auth/logout" method="POST" className="md:hidden">
            <button
              type="submit"
              className="
                h-[35px] w-full
                border border-black/15
                text-[12px] font-semibold uppercase tracking-[0.02em]
                text-black/70
                hover:text-black hover:border-black/30
                transition
              "
            >
              Выход
            </button>
          </form>
        </div>
      </div>

      <div className="mt-[28px] px-[14px] sm:px-0">
        <Title>Безопасность</Title>

        <div className="mt-[12px] flex justify-center">
          <div className="w-full max-w-[330px]">
            <ChangePasswordButton className="h-[35px] w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
