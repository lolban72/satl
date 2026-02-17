"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "../../lib/cart-store";

function moneyRub(cents: number) {
  return `${(cents / 100).toFixed(0)}р`;
}

export default function CartPage() {
  const { items, setQty, removeItem, clear } = useCart();

  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  return (
    <div className="mx-auto max-w-[1440px] px-[65px] pt-[70px] pb-[140px]">
      {/* HEADER */}
      <div className="flex items-end justify-between">

        {items.length > 0 ? (
          <button
            onClick={clear}
            className="text-[11px] uppercase tracking-[0.08em] text-black/55 hover:text-black transition"
            type="button"
          >
            Очистить корзину
          </button>
        ) : null}
      </div>

      {/* EMPTY */}
      {items.length === 0 ? (
        <div className="mt-[70px] flex flex-col items-center">
          <div className="text-[16px] italic font-semibold text-black/85">Корзина пуста.</div>

          <Link
            href="/catalog"
            className="mt-[18px] inline-flex h-[40px] w-[220px] items-center justify-center bg-black text-white
                       text-[10px] font-bold uppercase tracking-[0.12em] hover:bg-black/85 transition"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="mt-[36px] grid gap-[28px] lg:grid-cols-[1fr_420px] lg:items-start">
          {/* LEFT: ITEMS */}
          <div className="min-w-0">
            <div className="grid gap-[16px]">
              {items.map((i) => {
                const key = `${i.productId}:${i.variantId ?? "no-variant"}`;
                const img = i.image || "https://picsum.photos/seed/cart/220/220";

                return (
                  <div key={key} className="border border-black/10 p-[10px] md:p-[18px]">
                    <div className="flex items-start gap-[16px] mt-[10px]">
                      {/* IMAGE */}
                      <div className="h-[150px] w-[180px] ml-[10px] mr-[15px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={i.title}
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                      </div>

                      {/* INFO */}
                      <div className="min-w-0 flex-1 font-semibold">
                        <div className="flex items-start justify-between gap-[14px] ">
                          <div className="min-w-0 ">
                            <div className="truncate text-[18px] font-semibold text-black" style={{fontFamily: "Brygada"}}>
                              {i.title}
                            </div>

                            <div className="mt-[6px] flex flex-wrap items-center gap-[12px]">
                              <div className="text-[15px] text-black/100" style={{fontFamily: "Brygada"}}>{moneyRub(i.price)}</div>

                              {/* ✅ размер вместо variant */}
                              <div className="text-[10px] uppercase tracking-[0.08em] text-black/100 mt-[3px]" >
                                Размер: <span style={{fontFamily: "Brygada"}} className="text-[12px]">{i.size ? String(i.size).toUpperCase() : "—"}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            className="text-[10px] uppercase tracking-[0.08em] text-black/45 hover:text-black transition"
                            onClick={() => removeItem(i.productId, i.variantId)}
                            type="button"
                          >
                            Удалить
                          </button>
                        </div>

                        {/* QTY + SUBTOTAL */}
                        <div className="mt-[20px] flex flex-wrap items-center justify-between gap-[12px]">
                          <div className="flex items-center gap-[10px]">
                            <div className="flex items-center mt-[25px]">
                              <button
                                type="button"
                                onClick={() => setQty(i.productId, i.variantId, Math.max(1, i.qty - 1))}
                                className="h-[34px] w-[34px] border border-black/15 text-[16px] leading-none
                                           hover:border-black/35 transition active:scale-[0.98]"
                                aria-label="Уменьшить количество"
                              >
                                −
                              </button>

                              <div
                                className="h-[34px] w-[52px] border-y border-black/15 grid place-items-center
                                           text-[12px] font-semibold"
                                aria-label="Количество"
                              >
                                {i.qty}
                              </div>

                              <button
                                type="button"
                                onClick={() => setQty(i.productId, i.variantId, i.qty + 1)}
                                className="h-[34px] w-[34px] border border-black/15 text-[16px] leading-none
                                           hover:border-black/35 transition active:scale-[0.98]"
                                aria-label="Увеличить количество"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="text-[15px] text-black/100 mt-[25px]" style={{fontFamily: "Brygada"}}>
                            Сумма:{""}
                            <span className="font-semibold text-black ml-[5px]">
                              {moneyRub(i.price * i.qty)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: SUMMARY */}
          <aside className="border border-black/10 p-[18px] lg:sticky lg:top-[110px]">
            <div className="text-[20px] font-semibold">Итого</div>

            <div className="mt-[14px] space-y-[10px] text-[12px] text-black/65">
              <div className="flex items-center justify-between" style={{fontFamily: "Brygada"}}>
                <span>Товары</span>
                <span className="text-black">{moneyRub(total)}</span>
              </div>

              <div className="flex items-center justify-between" style={{fontFamily: "Brygada"}}>
                <span>Доставка</span>
                <span className="text-black/45">Рассчитается на оформлении</span>
              </div>

              <div className="h-[1px] bg-black/10 my-[12px]" />

              <div className="flex items-center justify-between" style={{fontFamily: "Brygada"}}>
                <span className="text-black/70">К оплате</span>
                <span className="text-[16px] font-semibold text-black">{moneyRub(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-[16px] flex h-[46px] w-full items-center justify-center bg-black text-white
                         text-[10px] font-bold uppercase tracking-[0.12em] hover:bg-black/85 transition"
            >
              Оформить заказ
            </Link>

            <Link
              href="/catalog"
              className="mt-[10px] flex h-[40px] w-full items-center justify-center border border-black/20
                         text-[10px] font-semibold uppercase tracking-[0.12em] text-black/70
                         hover:border-black/45 hover:text-black transition"
            >
              Продолжить покупки
            </Link>

            <div className="mt-[12px] text-[10px] italic leading-[1.25] text-black/45">
              Итоговая стоимость доставки и скидок (если появятся) будет рассчитана на этапе оформления.
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
