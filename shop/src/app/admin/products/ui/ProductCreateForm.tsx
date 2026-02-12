"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  title: string;
  slug: string;
  showOnHome?: boolean;
  showInNav?: boolean;
};

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
  const [slug, setSlug] = useState("");
  const [priceRub, setPriceRub] = useState("1990");
  const [stock, setStock] = useState("10");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const computedSlug = useMemo(() => {
    const s = slug.trim();
    if (s) return s;
    return slugify(title);
  }, [slug, title]);

  useEffect(() => {
    // грузим категории
    (async () => {
      try {
        const res = await fetch("/api/admin/categories", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Не удалось загрузить категории");
        setCategories(data);

        // по умолчанию выберем первую категорию (если есть)
        if (data?.[0]?.id) setCategoryId(data[0].id);
      } catch (e: any) {
        setErr(e?.message || "Ошибка загрузки категорий");
      }
    })();
  }, []);

  useEffect(() => {
    // preview для файла
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function uploadSelectedFile(): Promise<string> {
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

  async function submit() {
    setErr(null);
    setOk(null);

    if (!title.trim() || title.trim().length < 2) {
      setErr("Название слишком короткое");
      return;
    }
    if (!computedSlug || computedSlug.length < 2) {
      setErr("Slug слишком короткий");
      return;
    }
    if (!categoryId) {
      setErr("Выбери категорию — иначе товар не попадёт на главную/в шапку");
      return;
    }

    setLoading(true);
    try {
      // 1) грузим фото (если выбрано)
      let imageUrl = "";
      if (file) imageUrl = await uploadSelectedFile();

      // 2) создаём товар
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: computedSlug,
          priceRub,
          stock,
          image: imageUrl || undefined,
          categoryId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Не удалось создать товар");

      setOk(`Создано: ${data.slug ?? computedSlug}`);

      // очистка
      setTitle("");
      setSlug("");
      setPriceRub("1990");
      setStock("10");
      setFile(null);

      router.refresh();
      router.push("/admin/products");
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
        <input
          className="rounded-xl border p-2"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="hoodie-gray"
        />
        <div className="text-xs text-gray-600">Итоговый slug: <b>{computedSlug || "—"}</b></div>
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Категория</span>
        <select
          className="rounded-xl border p-2"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          {categories.length === 0 ? (
            <option value="">Сначала добавь категории</option>
          ) : (
            categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))
          )}
        </select>
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Цена (₽)</span>
        <input className="rounded-xl border p-2" value={priceRub} onChange={(e) => setPriceRub(e.target.value)} />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Остаток (stock)</span>
        <input className="rounded-xl border p-2" value={stock} onChange={(e) => setStock(e.target.value)} />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Фото (с устройства)</span>
        <input
          type="file"
          accept="image/*"
          className="rounded-xl border p-2"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="text-xs text-gray-600">
            Выбрано: {file.name} ({Math.round(file.size / 1024)} KB)
          </div>
        ) : null}
      </label>

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="preview" className="h-40 w-40 rounded-xl border object-cover" />
      ) : null}

      <button
        className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
        disabled={loading || uploading || categories.length === 0}
        onClick={submit}
      >
        {uploading ? "Загружаю фото..." : loading ? "Создаю..." : "Добавить"}
      </button>

      {categories.length === 0 ? (
        <div className="text-sm text-gray-600">
          Нет категорий. Сначала создай категорию в <b>/admin/categories</b>.
        </div>
      ) : null}
    </div>
  );
}
