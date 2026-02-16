"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const safe = useMemo(() => (images?.length ? images.filter(Boolean) : []), [images]);
  const [active, setActive] = useState(0);
  const activeSrc = safe[active] ?? safe[0];

  // ===== animations state =====
  const [displaySrc, setDisplaySrc] = useState(activeSrc);
  const [fade, setFade] = useState(false);

  const thumbsRef = useRef<HTMLDivElement | null>(null);

  // FADE when active image changes
  useEffect(() => {
    if (!activeSrc) return;
    if (activeSrc === displaySrc) return;

    setFade(true); // fade out
    const t = window.setTimeout(() => {
      setDisplaySrc(activeSrc); // swap
      setFade(false); // fade in
    }, 160);

    return () => window.clearTimeout(t);
  }, [activeSrc, displaySrc]);

  // Smooth wheel scrolling (inertia) for thumbs
  useEffect(() => {
    const el = thumbsRef.current;
    if (!el) return;

    let raf = 0;
    let target = el.scrollTop;

    const animate = () => {
      const current = el.scrollTop;
      const next = current + (target - current) * 0.18; // easing
      el.scrollTop = next;

      if (Math.abs(target - next) > 0.5) {
        raf = requestAnimationFrame(animate);
      } else {
        el.scrollTop = target;
        raf = 0;
      }
    };

    const onWheel = (e: WheelEvent) => {
      // делаем свой плавный скролл
      e.preventDefault();
      target += e.deltaY;
      // clamp
      const max = el.scrollHeight - el.clientHeight;
      if (target < 0) target = 0;
      if (target > max) target = max;

      if (!raf) raf = requestAnimationFrame(animate);
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel as any);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // helper: smooth scroll selected thumb into view
  function scrollThumbIntoView(idx: number) {
    const root = thumbsRef.current;
    if (!root) return;
    const btn = root.querySelector<HTMLButtonElement>(`button[data-idx="${idx}"]`);
    if (!btn) return;
    btn.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  if (!safe.length) return null;

  return (
    <div className="flex items-start gap-[24px]">
      {/* THUMBS (как в макете: 3 видно, остальные скролл; тонкая рамка) */}
      <div
        ref={thumbsRef}
        className={[
          "mt-[40px]", // сильнее вниз, как на рефе
          "flex flex-col gap-[16px]",
          "h-[480px]", // ровно под 3 миниатюры (92*3 + 16*2 = 308) + запас
          "overflow-y-auto pr-[10px]",
          "[&::-webkit-scrollbar]:w-0",
          "[&::-webkit-scrollbar-thumb]:bg-transparent",
        ].join(" ")}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {safe.map((src, idx) => {
          const isActive = idx === active;
          return (
            <button
              key={src + idx}
              data-idx={idx}
              type="button"
              onClick={() => {
                setActive(idx);
                scrollThumbIntoView(idx);
              }}
              className={[
                "h-[200px] w-[140px]",
                "transition",
                "flex items-center justify-center", // центрируем контент
              ].join(" ")}
              aria-label={`Фото ${idx + 1}`}
            >
              <img
                src={src}
                alt={title}
                className="h-full w-full object-containЫ" // ✅ ключ: contain + padding
                draggable={false}
                style={{
                  // микро-анимация миниатюры при выборе (не меняет классы)
                  transform: isActive ? "scale(0.985)" : "scale(1)",
                  transition: "transform 180ms ease",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* MAIN IMAGE (как в макете: без “белого квадрата”, пятно под футболкой) */}
      <div className="relative h-[580px] w-[680px]">
        {/* пятно (не на весь блок, а по центру) */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[430px] w-[560px] -translate-x-1/2 -translate-y-1/2 blur-[55px] opacity-55"
          style={{ backgroundColor: "#9B9B9B" }}
          aria-hidden="true"
        />

        {/* фото (прозрачный фон блока) */}
        <div className="absolute inset-0">
          <img
            src={displaySrc}
            alt={title}
            className="h-full w-full object-contain"
            draggable={false}
            style={{
              opacity: fade ? 0 : 1,
              transform: fade ? "scale(0.985)" : "scale(1)",
              transition: "opacity 260ms ease, transform 260ms ease",
              willChange: "opacity, transform",
            }}
          />
        </div>
      </div>
    </div>
  );
}
