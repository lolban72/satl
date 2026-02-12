"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; title: string; slug: string };

type ProductInput = {
  id: string;
  title: string;
  slug: string;
  price: number;
  image: string | null; // первый image
  stock: number;        // сумма/или первый variant stock
  categoryId: string | null;
};

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProductEditForm({
  product,
  categories,
}: {
  product: ProductInput;
  categories: Category[];
}) {
  const router = useRouter();

  const [title, setTitle] = useState(product.title);
  const [slug, setSlug] = useState(product.slug);
  const [priceRub, setPriceRub] = useState(String((product.price / 100).toFixed(0)));
  const [stock, setStock] = useState(String(product.stock));
  const [categoryId, setCategoryId] = useState<string>(product.categoryId ?? "");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const computedSlug = useMemo(() => (slug.trim() ? slug.trim() : slugify(title)), [slug, title]);

  useEffect(() => {
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

  async function save() {
    setErr(null);
    setOk(null);

    if (title.trim().length < 2) return setErr("Название слишком короткое");
    if (computedSlug.length < 2) return setErr("Slug слишком короткий");

    setSaving(true);
    try {
      // если выбрали новый файл — загрузим и отправим url
      let imageUrl: string | undefined = undefined;
      if (file) {
        imageUrl = await uploadSelectedFile();
      }

      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: computedSlug,
          priceRub,
          stock,
          categoryId: categoryId || null,
          image: imageUrl, // если undefined — не трогаем, если строка — заменим
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Не удалось сохранить");

      setOk("Сохранено ✅");
      setFile(null);

      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Удалить товар? Это действие нельзя отменить.")) return;

    setErr(null);
    setOk(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Не удалось удалить");

      router.push("/admin/products");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Ошибка");
    } finally {
      setSaving(false);
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
        <span className="text-sm font-medium">Slug</span>
        <input className="rounded-xl border p-2" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <div className="text-xs text-gray-600">
          Итоговый slug: <b>{computedSlug || "—"}</b>
        </div>
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Категория</span>
        <select className="rounded-xl border p-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">— Без категории —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <div className="text-xs text-gray-600">
          Если убрать категорию — товар исчезнет из категорий на главной/в шапке.
        </div>
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Цена (₽)</span>
        <input className="rounded-xl border p-2" value={priceRub} onChange={(e) => setPriceRub(e.target.value)} />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Остаток (stock)</span>
        <input className="rounded-xl border p-2" value={stock} onChange={(e) => setStock(e.target.value)} />
      </label>

      <div className="grid gap-2">
        <div className="text-sm font-medium">Фото</div>

        <div className="flex flex-wrap items-start gap-4">
          {/* Текущее фото */}
          <div className="grid gap-2">
            <div className="text-xs text-gray-600">Текущее</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image ?? "https://picsum.photos/seed/placeholder/200/200"}
              alt="current"
              className="h-32 w-32 rounded-xl border object-cover"
            />
          </div>

          {/* Новое фото */}
          <div className="grid gap-2">
            <div className="text-xs text-gray-600">Новое (если нужно заменить)</div>
            <input
              type="file"
              accept="image/*"
              className="rounded-xl border p-2"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="preview" className="h-32 w-32 rounded-xl border object-cover" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={saving || uploading}
          onClick={save}
        >
          {uploading ? "Загружаю фото..." : saving ? "Сохраняю..." : "Сохранить"}
        </button>

        <button
          className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          disabled={saving || uploading}
          onClick={() => router.push("/admin/products")}
        >
          Назад
        </button>

        <button
          className="ml-auto rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
          disabled={saving || uploading}
          onClick={remove}
        >
          Удалить
        </button>
      </div>
    </div>
  );
}
