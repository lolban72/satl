"use client";

import { useEffect, useMemo, useState } from "react";
import { akonyBold } from "@/lib/fonts";

function buildSatlLine(count: number) {
  return Array.from({ length: count }, () => "SATL").join(" ");
}

export default function Footer() {
  const [count, setCount] = useState(6);

  useEffect(() => {
    const recalc = () => {
      const w = window.innerWidth;
      const approxWord = 240;
      setCount(Math.max(6, Math.ceil(w / approxWord) + 2));
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  const line = useMemo(() => buildSatlLine(count), [count]);

  return (
    <footer className="bg-white text-black mt-[120px] flex flex-col">
      {/* ===== ВЕРХ ФУТЕРА (как на скрине) ===== */}
      <div className="mx-auto w-full max-w-[1440px] px-[15px]">
        <div className="grid grid-cols-12 items-start">
          {/* Покупателям */}
            <div className="col-span-5">
            <div className="font-bold italic text-[20px] leading-none tracking-[-0.05em]">
                Покупателям
            </div>

            <div className="mt-[10px] flex gap-x-[80px]">
                <div className="flex flex-col gap-y-[6px] text-[8px] leading-[1.2] uppercase tracking-[0.02em] text-black/80">
                <a href="#" className="hover:text-black transition">
                    пользовательское соглашение
                </a>
                <a href="#" className="hover:text-black transition">
                    политика обработки персональных данных
                </a>
                <a href="#" className="hover:text-black transition">
                    политика конфиденциальности
                </a>
                </div>

                <div className="flex flex-col gap-y-[6px] text-[9px] leading-[1.2] uppercase tracking-[0.02em] text-black/80">
                <a href="#" className="hover:text-black transition">
                    доставка и оплата
                </a>
                <a href="#" className="hover:text-black transition">
                    обмен и возврат
                </a>
                <a href="#" className="hover:text-black transition">
                    публичная оферта
                </a>
                </div>
            </div>
            </div>


            {/* Контакты */}
            <div className="col-span-3">
            <div className="font-bold italic text-[20px] leading-none tracking-[-0.05em]">
                Контакты
            </div>

            <div className="mt-[10px] flex gap-x-[48px]">
                <div className="flex flex-col gap-y-[6px] text-[8px] leading-[1.2] uppercase tracking-[0.02em] text-black/80">
                <a href="#" className="hover:text-black transition">
                    контакты
                </a>
                <a href="#" className="hover:text-black transition">
                    телеграм
                </a>
                <a href="#" className="hover:text-black transition">
                    почта
                </a>
                </div>

                <div className="flex flex-col gap-y-[6px] text-[9px] leading-[1.2] uppercase tracking-[0.02em] text-black/80">
                <a href="#" className="hover:text-black transition">
                    вк
                </a>
                <a href="#" className="hover:text-black transition">
                    тикток
                </a>
                </div>
            </div>
            </div>


          {/* Подписка */}
          <div className="col-span-4">
            <div className="font-bold italic text-[20px] leading-none tracking-[-0.05em]">Подписаться на рассылку</div>
                <div className="mt-[12px] flex items-center gap-[16px]">
                <input
                    placeholder="Ваш E-mail*"
                    className="
                    h-[32px]
                    w-[220px]
                    border border-[#BFBFBF]
                    px-[10px]
                    text-[11px]
                    tracking-[0.02em]
                    outline-none
                    placeholder:text-black/50
                    focus:border-black
                    transition
                    "
                />

                <button
                    type="button"
                    className="
                    h-[32px]
                    px-[28px]
                    bg-black
                    text-white
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.02em]
                    transition
                    hover:bg-[#111]
                    active:scale-[0.98]
                    "
                >
                    подписаться
                </button>
                </div>

            <div className="mt-[6px] text-[8px] italic leading-[1.15] text-black/70">
              Нажав на кнопку “Подписаться”, Вы соглашаетесь с политикой обработки персональных данных и даете согласие
              на обработку персональных данных
            </div>
          </div>
        </div>
      </div>

      {/* ===== НИЖНИЙ SATL ===== */}
      <div className="mt-auto w-full overflow-hidden">
        <div
          className={`${akonyBold.className} whitespace-nowrap uppercase leading-none`}
          style={{
            fontSize: 100,              // AKONY bold 100px
            letterSpacing: "-0.19em",   // tracking -19%
            transform: "translateY(22px)",
          }}
        >
          {line}
        </div>
      </div>
    </footer>
  );
}
