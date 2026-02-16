import Link from "next/link";

export default function ProductCard({
  slug,
  title,
  price,
  imageUrl,
  isSoon = false,
  discountPercent = 0,
}: {
  slug: string;
  title: string;
  price: number;
  imageUrl?: string | null;
  isSoon?: boolean;
  discountPercent?: number;
}) {
  const Wrapper: any = isSoon ? "div" : Link;
  const wrapperProps = isSoon ? {} : { href: `/product/${slug}` };

  const showDiscount = !isSoon && (discountPercent ?? 0) > 0;

  return (
    <Wrapper {...wrapperProps} className="relative block w-[400px] text-center overflow-visible">
      {/* ✅ СКИДКА: позиционируется относительно всей карточки (не режется overflow-hidden картинки) */}
      {showDiscount ? (
        <div className="absolute right-[18px] top-[-20px] z-10 pointer-events-none">
          <span
            className="text-[20px] leading-none"
            style={{
              fontFamily: "Yeast",
              fontWeight: 300,
              color: "#B60404",
            }}
          >
            -{discountPercent}
          </span>
          <span
            className="text-[16px] leading-none"
            style={{
              fontFamily: "YrsaBold",
              fontWeight: 700,
              color: "#B60404",
              marginLeft: "1px",
            }}
          >
            %
          </span>
        </div>
      ) : null}

      {/* ОБЛАСТЬ ИЗОБРАЖЕНИЯ */}
      <div className="relative mx-auto h-[300px] w-[400px]">
        {!isSoon && (
          <div
            className="absolute inset-0 rounded-[60px] opacity-70 blur-[38px]"
            style={{ backgroundColor: "#929292" }}
            aria-hidden="true"
          />
        )}

        <div className="absolute inset-0 z-10 overflow-hidden rounded-[60px]">
          <img
            src={imageUrl ?? "https://picsum.photos/seed/product/800/600"}
            alt={title}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
      </div>

      {/* НАЗВАНИЕ */}
      <div className="mt-5">
        <div className="text-[30px] leading-none" style={{ fontFamily: "Yeast" }}>
          {title}
        </div>

        {!isSoon && (
          <div className="mt-2 text-[25px] leading-none" style={{ fontFamily: "Yeast" }}>
            {(price / 100).toFixed(0)}р
          </div>
        )}
      </div>

      {/* СТЕКЛО "СКОРО" — оставляю как у тебя (если нужно — верну Kanit через CSS тоже) */}
      {isSoon && (
        <div className="absolute inset-0 z-20">
          <div
            className="absolute inset-0 rounded-[50px] bg-black/15 backdrop-blur-[28px]"

          />
          <div className="absolute inset-0 grid place-items-center">
            <div
              className="text-[64px] tracking-[-0.02em] text-white uppercase"
              style={{
                fontFamily: "Montserrat", // можно не писать вообще
                fontWeight: 800,       // ✅ станет extra-bold/black
                fontSynthesis: "none",
                textShadow: "0 6px 12px rgba(0,0,0,0.6)",
                WebkitTextStroke: "3px rgb(255, 255, 255)",
              }}
            >
              СКОРО
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
}
