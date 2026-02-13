import Link from "next/link";

export default function ProductCard({
  slug,
  title,
  price,
  imageUrl,
  isSoon = false,
}: {
  slug: string;
  title: string;
  price: number;
  imageUrl?: string | null;
  isSoon?: boolean;
}) {
  const Wrapper: any = isSoon ? "div" : Link;
  const wrapperProps = isSoon ? {} : { href: `/product/${slug}` };

  return (
    <Wrapper {...wrapperProps} className="block w-[400px] text-center">
      <div className="relative mx-auto h-[300px] w-[400px]">
        {/* ✅ МЯГКАЯ ТЕНЬ / LAYER BLUR (основной эффект) */}
        <div
          className="absolute inset-0 rounded-[60px] opacity-70 blur-[38px]"
          style={{
            backgroundColor: "#929292",
          }}
          aria-hidden="true"
        />



        {/* фото */}
        <div className="absolute inset-0 z-10 flex items-center justify-center p-[8px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl ?? "https://picsum.photos/seed/product/800/600"}
            alt={title}
            className="max-h-full max-w-full object-contain"
            draggable={false}
          />
        </div>

        {/* ✅ СКОРО OVERLAY */}
        {isSoon ? (
          <div className="absolute inset-0 z-20 grid place-items-center">
            <div
              className="grid h-[365px] w-[365px] place-items-center rounded-[22px]
                         border border-white/30 bg-white/15
                         backdrop-blur-[22px]"
              style={{
                boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              }}
            >
              <div
                className="font-extrabold text-[70px] tracking-[-0.11em] text-white uppercase"
                style={{
                  textShadow: "0px 0px 15px rgba(0,0,0,1)",
                }}
              >
                СКОРО
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* обычный товар: показываем название/цену */}
      {!isSoon ? (
        <div className="mt-5">
          <div className="text-[30px] leading-none" style={{ fontFamily: "Yeast" }}>
            {title}
          </div>
          <div className="mt-2 text-[25px] leading-none" style={{ fontFamily: "Yeast" }}>
            {(price / 100).toFixed(0)}р
          </div>
        </div>
      ) : null}
    </Wrapper>
  );
}
