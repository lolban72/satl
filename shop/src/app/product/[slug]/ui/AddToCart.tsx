"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart-store";

type Variant = { id: string; size: string; color: string; stock: number };

export default function AddToCart(props: {
  productId: string;
  title: string;
  price: number;
  image?: string;
  variants: Variant[];
}) {
  const addItem = useCart((s) => s.addItem);
  const [variantId, setVariantId] = useState<string | undefined>(
    props.variants[0]?.id
  );
  const [qty, setQty] = useState(1);

  const current = useMemo(
    () => props.variants.find((v) => v.id === variantId),
    [props.variants, variantId]
  );

  const disabled = !current || current.stock <= 0;

  return (
    <div className="rounded-2xl border p-4">
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium">Вариант</label>
        <select
          className="rounded-xl border p-2"
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
        >
          {props.variants.map((v) => (
            <option key={v.id} value={v.id} disabled={v.stock <= 0}>
              {v.color} / {v.size} {v.stock <= 0 ? "(нет)" : ""}
            </option>
          ))}
        </select>

        <label className="text-sm font-medium">Количество</label>
        <input
          className="w-24 rounded-xl border p-2"
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
        />

        <button
          className="mt-2 rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={disabled}
          onClick={() => {
            if (!variantId) return;
            addItem({
              productId: props.productId,
              variantId,
              title: props.title,
              price: props.price,
              image: props.image,
              qty,
            });
          }}
        >
          {disabled ? "Нет в наличии" : "Добавить в корзину"}
        </button>
      </div>
    </div>
  );
}
