"use client";

import { useEffect, useState } from "react";

type Banner = {
  enabled: boolean;
  title: string;
  subtitle?: string | null;
  buttonText?: string | null;
  buttonHref?: string | null;
  imageUrl?: string | null;
  overlay: number;
};

export default function HeroBannerEditor() {
  const [b, setB] = useState<Banner | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const res = await fetch("/api/admin/hero", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setErr(data?.error || "Не удалось загрузить");
      return;
    }
    setB(data);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function upload(): Promise<string> {
    if (!file) return "";
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Не удалось загрузить фото");
      return String(data.url || "");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!b) return;
    setErr(null);
    setOk(null);
    setSaving(true);
    try {
      let imageUrl = b.imageUrl ?? "";
      if (file) imageUrl = await upload();

      const res = await fetch("/api/admin/hero", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...b,
          imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Не удалось сохранить");

      setB(data);
      setFile(null);
      setOk("Сохранено ✅");
    } catch (e: any) {
      setErr(e?.message || "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  if (!b) return <div className="text-sm text-gray-600">Загрузка...</div>;

  return (
    <div className="grid gap-3">
      {err && <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm">{err}</div>}
      {ok && <div className="rounded-xl border border-green-300 bg-green-50 p-3 text-sm">{ok}</div>}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={b.enabled}
          onChange={(e) => setB({ ...b, enabled: e.target.checked })}
        />
        Включить баннер
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Заголовок</span>
        <input className="rounded-xl border p-2" value={b.title} onChange={(e) => setB({ ...b, title: e.target.value })} />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Подзаголовок</span>
        <input className="rounded-xl border p-2" value={b.subtitle ?? ""} onChange={(e) => setB({ ...b, subtitle: e.target.value })} />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Текст кнопки</span>
          <input className="rounded-xl border p-2" value={b.buttonText ?? ""} onChange={(e) => setB({ ...b, buttonText: e.target.value })} />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Ссылка кнопки</span>
          <input className="rounded-xl border p-2" value={b.buttonHref ?? ""} onChange={(e) => setB({ ...b, buttonHref: e.target.value })} />
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Затемнение (0–100)</span>
        <input
          type="number"
          className="rounded-xl border p-2"
          value={b.overlay}
          onChange={(e) => setB({ ...b, overlay: Number(e.target.value) })}
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Фоновое изображение</span>
        <input type="file" accept="image/*" className="rounded-xl border p-2" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>

      <div className="flex flex-wrap gap-4">
        <div className="grid gap-1">
          <div className="text-xs text-gray-600">Текущее</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.imageUrl ?? "https://picsum.photos/seed/hero/600/400"} alt="" className="h-32 w-52 rounded-xl border object-cover" />
        </div>

        {preview ? (
          <div className="grid gap-1">
            <div className="text-xs text-gray-600">Новое</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="h-32 w-52 rounded-xl border object-cover" />
          </div>
        ) : null}
      </div>

      <button
        className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
        disabled={saving || uploading}
        onClick={save}
      >
        {uploading ? "Загружаю..." : saving ? "Сохраняю..." : "Сохранить"}
      </button>
    </div>
  );
}
