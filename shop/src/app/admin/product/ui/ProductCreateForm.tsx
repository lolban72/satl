"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProductCreateForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [priceRub, setPriceRub] = useState("1990");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState("10");
  const [slug, setSlug] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    setOk(null);

    const computedSlug = slug.trim() ? slug.trim() : slugify(title);

    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: computedSlug,
          priceRub,
          image,
          stock,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Не удалось создать товар");

      setOk(`Создано: ${data.slug}`);
      setTitle("");
      setSlug("");
      setImage("");
      setPriceRub("1990");
      setStock("10");

      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 grid gap-3">
      {err && <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm">{err}</div>}
      {ok && <div className="rounded-xl border border-green-300 bg-green-50 p-3 text-sm">{ok}</div>}

      <label className="grid gap-1">
        <span className="text-sm font-medium">Название</span>
        <input className="rounded-xl border p-2" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Slug (необязательно)</span>
        <input className="rounded-xl border p-2" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="hoodie-gray" />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Цена (₽)</span>
        <input className="rounded-xl border p-2" value={priceRub} onChange={(e) => setPriceRub(e.target.value)} />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Картинка (URL, необязательно)</span>
        <input className="rounded-xl border p-2" value={image} onChange={(e) => setImage(e.target.value)} />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Остаток (stock)</span>
        <input className="rounded-xl border p-2" value={stock} onChange={(e) => setStock(e.target.value)} />
      </label>

      <button
        className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
        disabled={loading}
        onClick={submit}
      >
        {loading ? "Создаю..." : "Добавить"}
      </button>
    </div>
  );
}
