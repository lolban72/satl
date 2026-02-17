import Link from "next/link";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return (
    <div className="mx-auto max-w-[1440px] px-[65px] pt-[90px] pb-[160px] text-black bg-white">
      <div className="max-w-[720px]">

        {/* TITLE */}
        <div className="text-[28px] font-semibold tracking-[-0.02em]">
          Заказ принят
        </div>

        <div className="mt-[8px] text-[13px] text-black/55">
          Спасибо за покупку. Мы свяжемся с вами для подтверждения доставки.
        </div>

        {/* ORDER NUMBER */}
        <div className="mt-[32px] border border-black/10 p-[22px]">
          <div className="text-[10px] uppercase tracking-[0.12em] text-black/55">
            Номер заказа
          </div>

          <div className="mt-[8px] font-mono text-[16px] tracking-[0.02em]">
            {orderId ?? "—"}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-[36px] flex flex-wrap gap-[14px]">
          <Link
            href="/catalog"
            className="flex h-[46px] w-[220px] items-center justify-center bg-black text-white
                       text-[10px] font-bold uppercase tracking-[0.12em]
                       hover:bg-black/85 transition"
          >
            В каталог
          </Link>

          <Link
            href="/"
            className="flex h-[46px] w-[220px] items-center justify-center
                       border border-black/20 text-[10px] font-semibold uppercase tracking-[0.12em]
                       text-black/70 hover:border-black/45 hover:text-black transition"
          >
            На главную
          </Link>
        </div>

        {/* INFO TEXT */}
        <div className="mt-[28px] text-[11px] italic leading-[1.35] text-black/45">
          Если у вас возникнут вопросы по заказу, пожалуйста, сохраните номер заказа и свяжитесь с поддержкой.
        </div>

      </div>
    </div>
  );
}
