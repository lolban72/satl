import Link from "next/link";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Заказ принят 🎉</h1>
      <p className="mt-3 text-gray-600">
        Номер заказа: <span className="font-mono">{orderId ?? "—"}</span>
      </p>

      <div className="mt-6 flex gap-3">
        <Link className="rounded-xl bg-black px-4 py-2 text-white" href="/catalog">
          В каталог
        </Link>
        <Link className="rounded-xl border px-4 py-2" href="/cart">
          Корзина
        </Link>
      </div>
    </div>
  );
}
