"use client";

import Link from "next/link";
import { useCart } from "../../lib/cart-store";

export default function CartPage() {
  const { items, setQty, removeItem, clear } = useCart();

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Корзина</h1>

      {items.length === 0 ? (
        <div className="mt-6">
          <p>Корзина пуста.</p>
          <Link className="underline" href="/catalog">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-4">
            {items.map((i) => (
              <div key={`${i.productId}:${i.variantId}`} className="rounded-2xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{i.title}</div>
                    <div className="text-sm text-gray-600">
                      {(i.price / 100).toFixed(2)} ₽
                    </div>
                  </div>

                  <button
                    className="text-sm underline"
                    onClick={() => removeItem(i.productId, i.variantId)}
                  >
                    Удалить
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <span className="text-sm">Кол-во:</span>
                  <input
                    type="number"
                    min={1}
                    className="w-24 rounded-xl border p-2"
                    value={i.qty}
                    onChange={(e) =>
                      setQty(i.productId, i.variantId, Number(e.target.value || 1))
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Итого</div>
              <div className="text-lg font-bold">{(total / 100).toFixed(2)} ₽</div>
            </div>

            <div className="mt-4 flex gap-3">
              <button className="rounded-xl border px-4 py-2" onClick={clear}>
                Очистить
              </button>
              <Link
                className="rounded-xl bg-black px-4 py-2 text-white"
                href="/checkout"
              >
                Оформить
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
