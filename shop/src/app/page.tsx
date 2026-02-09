import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl p-10">
      <h1 className="text-3xl font-semibold">Магазин бренда</h1>
      <p className="mt-3 text-gray-600">
        Добро пожаловать! Перейдите в каталог, чтобы посмотреть товары.
      </p>

      <div className="mt-6 flex gap-3">
        <Link className="rounded-xl bg-black px-4 py-2 text-white" href="/catalog">
          Каталог
        </Link>
        <Link className="rounded-xl border px-4 py-2" href="/cart">
          Корзина
        </Link>
      </div>
    </div>
  );
}
