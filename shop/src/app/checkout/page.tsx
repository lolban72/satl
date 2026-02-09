"use client";

import { useMemo, useState } from "react";
import { useCart } from "../../lib/cart-store";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCart();
  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);

    if (items.length === 0) {
      setErr("Корзина пуста.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, phone, address },
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            qty: i.qty,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Не удалось создать заказ");

      clear();
      router.push(`/order-success?orderId=${encodeURIComponent(data.orderId)}`);
    } catch (e: any) {
      setErr(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Оформление заказа</h1>

      {err && (
        <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm">
          {err}
        </div>
      )}

      <div className="mt-6 grid gap-4 rounded-2xl border p-4">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Имя</span>
          <input
            className="rounded-xl border p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Иван"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Телефон</span>
          <input
            className="rounded-xl border p-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7..."
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Адрес</span>
          <input
            className="rounded-xl border p-2"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Город, улица, дом, квартира"
          />
        </label>

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-gray-600">Итого</div>
          <div className="text-lg font-bold">{(total / 100).toFixed(2)} ₽</div>
        </div>

        <button
          className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={loading}
          onClick={submit}
        >
          {loading ? "Оформляем..." : "Оформить заказ"}
        </button>
      </div>
    </div>
  );
}
