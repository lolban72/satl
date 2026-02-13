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
      className="relative w-full overflow-hidden pt-50"
      style={{
        minHeight: "calc(100vh - 110px)", // 30px marquee + 80px header
      }}
    >
      {/* FULL WIDTH BACKGROUND */}
      {banner.imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* overlay */}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlay / 100 }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-100" />
      )}

      {/* CONTENT CONTAINER (центрируем текст) */}
      <div className="relative flex min-h-[calc(100vh-110px)] items-center">
        <div className="mx-auto w-full max-w-[1440px] px-[65px]">
          <div className="max-w-xl text-black">
            <h1 className="font-bold text-[65px] leading-[0.95] tracking-[-0.19em]">
              {banner.title}
            </h1>

            {banner.subtitle && (
              <p className="mt-6 text-[16px] text-black/80">
                {banner.subtitle}
              </p>
            )}

            {banner.buttonText && banner.buttonHref && (
              <div className="mt-8">
                <Link
                  href={banner.buttonHref}
                  className="inline-flex items-center rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  {banner.buttonText}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
