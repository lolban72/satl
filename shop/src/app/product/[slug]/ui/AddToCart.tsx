"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart-store";
import Link from "next/link";

export default function AddToCart({
  productId,
  title,
  price,
  image,
  variants,
  cartHref = "/cart",
}: any) {
  const addItem = useCart((s) => s.addItem);
  const [size, setSize] = useState(variants[0]?.size);

  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const imgSrc = useMemo(
    () => image ?? "https://picsum.photos/seed/product/240/240",
    [image]
  );

  function startAutoClose() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      // сначала анимация ухода, потом убрать из DOM
      setClosing(true);
      window.setTimeout(() => {
        setOpen(false);
        setClosing(false);
      }, 220);
    }, 8000);
  }

  function openToast() {
    setOpen(true);
    setClosing(false);
    startAutoClose();
  }

  function closeToast() {
    if (!open) return;
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 220);
  }

  // cleanup
  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div>
      {/* SIZES */}
      <div className="flex gap-[8px]" style={{ fontFamily: "Yeast" }}>
        {variants.map((v: any) => (
          <button
            key={v.id}
            onClick={() => setSize(v.size)}
            className={[
              " flex items-center justify-center h-[36px] w-[36px] border text-[20px] font-bold",
              size === v.size ? "bg-black text-white" : "bg-white text-black",
            ].join(" ")}
          >
            <div className="mt-[2px]">{v.size}</div>
          </button>
        ))}
      </div>

      <div className="mt-[5px] text-[10px] text-black/45">Таблица размеров</div>

      {/* BUTTON */}
      <button
        className="mt-[16px] h-[50px] w-full bg-black text-white text-[20px] uppercase tracking-[-0.05em]"
        style={{ fontFamily: "Brygada" }}
        onClick={() => {
          addItem({
            productId,
            title,
            price,
            image,
            qty: 1,
          });
          openToast();
        }}
      >
        ДОБАВИТЬ В КОРЗИНУ
      </button>

      {/* TOAST (правый нижний угол, без затемнения) */}
      {open ? (
        <div
          className="fixed bottom-[26px] right-[26px] z-[9999]"
          style={{
            transform: closing ? "translateY(10px)" : "translateY(0)",
            opacity: closing ? 0 : 1,
            transition: "transform 220ms ease, opacity 220ms ease",
          }}
        >
          <div
            className="relative w-[520px] bg-white border border-black/60"
            style={{
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              animation: "satl-in 220ms ease-out",
            }}
            onMouseEnter={() => {
              // пауза автозакрытия при наведении (по желанию)
              if (closeTimer.current) window.clearTimeout(closeTimer.current);
            }}
            onMouseLeave={() => {
              startAutoClose();
            }}
          >
            {/* close */}
            <button
              type="button"
              onClick={closeToast}
              className="absolute right-[16px] top-[14px] text-black/70 hover:text-black transition"
              aria-label="Закрыть"
              style={{ fontSize: 22, lineHeight: 1 }}
            >
              ×
            </button>

            <div className="flex items-center gap-[30px] px-[15px]">
              {/* image */}
              <div className="h-[150px] w-[150px] flex items-center justify-center mr-[20px] ml-[20px]">
                <img
                  src={imgSrc}
                  alt={title}
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              </div>

              {/* text */}
              <div className="flex-">
                <div
                  className="text-[14px] uppercase"
                  style={{ fontFamily: "Brygada", fontWeight: 700 }}
                >
                  {String(title ?? "").toUpperCase()}
                </div>

                <div
                  className="mt-[4px] text-[13px]"
                  style={{ fontFamily: "Brygada", fontWeight: 700 }}
                >
                  УЖЕ В КОРЗИНЕ
                </div>

                <Link
                  href={cartHref}
                  className="mt-[14px] inline-flex h-[42px] w-[260px] items-center justify-center bg-black text-white uppercase"
                  style={{ fontFamily: "Brygada", fontWeight: 700, fontSize: 14 }}
                  onClick={closeToast}
                >
                  ОФОРМИТЬ ЗАКАЗ
                </Link>
              </div>
            </div>

            <style jsx>{`
              @keyframes satl-in {
                from {
                  transform: translateY(10px);
                  opacity: 0;
                }
                to {
                  transform: translateY(0);
                  opacity: 1;
                }
              }
            `}</style>
          </div>
        </div>
      ) : null}
    </div>
  );
}
