"use client";

import { useState } from "react";
import Link from "next/link";
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
    <div>
      <Title>Личные данные</Title>

      <div className="mt-[20px] flex flex-col items-center gap-[14px]">
        <label className="block">
          <Label>Имя</Label>
          <Input value={name} onChange={setName} />
        </label>

        <label className="block">
          <Label>Телефон</Label>
          <Input value={phone} onChange={setPhone} />
        </label>

        <label className="block">
          <Label>E-mail</Label>
          <input
            type="email"
            value={email}
            readOnly
            className="h-[35px] w-[330px] border border-black/15 px-[10px] font-semibold text-[12px] outline-none bg-black/0 text-black/60"
          />
        </label>

        <div className="pt-[6px]">
          <PrimaryButton disabled={saving} onClick={save}>
            {saving ? "Сохранение..." : "Сохранить"}
          </PrimaryButton>
        </div>

        {ok ? <div className="text-[11px] text-black/70">{ok}</div> : null}
        {err ? <div className="text-[11px] text-[#B60404]">{err}</div> : null}
      </div>

      <div className="mt-[28px]">
        <Title>Безопасность</Title>
        <div className="mt-[12px] flex justify-center">
        <ChangePasswordButton />
        </div>
      </div>
    </div>
  );
}
