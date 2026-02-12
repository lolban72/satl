import Link from "next/link";

export default function HeroBanner({
  banner,
}: {
  banner: {
    enabled: boolean;
    title: string;
    subtitle?: string | null;
    buttonText?: string | null;
    buttonHref?: string | null;
    imageUrl?: string | null;
    overlay: number;
  } | null;
}) {
  if (!banner?.enabled) return null;

  const overlay = Math.min(100, Math.max(0, banner.overlay ?? 25));

  return (
    <section
      className="relative w-full border-b bg-white"
      style={{
        // 30px marquee + 80px header = 110px
        minHeight: "calc(100vh - 110px)",
      }}
    >
      {banner.imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlay / 100 }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50" />
      )}

      <div className="relative mx-auto flex min-h-[calc(100vh-110px)] max-w-[1440px] items-center px-[65px]">
        <div className="max-w-xl">
          <h1 className="font-bold text-[56px] leading-[0.95] tracking-[-0.04em]">
            {banner.title}
          </h1>

          {banner.subtitle ? (
            <p className="mt-4 text-[16px] text-black/70">
              {banner.subtitle}
            </p>
          ) : null}

          {banner.buttonText && banner.buttonHref ? (
            <div className="mt-7">
              <Link
                href={banner.buttonHref}
                className="inline-flex items-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                {banner.buttonText}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
