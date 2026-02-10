import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { variants: true },
  });

  return (
    <div>
      {/* Баннеры / Hero */}
      <section className="mx-auto max-w-6xl p-6">
        <div className="rounded-3xl border p-8">
          <h1 className="text-4xl font-semibold">Новая коллекция</h1>
          <p className="mt-3 text-gray-600">
            Минимальный hero-блок. Кнопка “Каталог” в навбаре прокрутит ниже — к товарам.
          </p>
          <div className="mt-6">
            <Link href="/#catalog" className="rounded-xl bg-black px-4 py-2 text-white">
              Смотреть товары
            </Link>
          </div>
        </div>
      </section>

      {/* Секция каталога на главной */}
      <section id="catalog" className="mx-auto max-w-6xl p-6">
        <h2 className="text-2xl font-semibold">Товары</h2>

        {products.length === 0 ? (
          <p className="mt-4 text-gray-600">Пока нет товаров. Добавь их через админку.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const inStock = p.variants.some((v) => v.stock > 0);
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="rounded-2xl border p-4 hover:shadow-sm transition"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.images?.[0] ?? "https://picsum.photos/seed/product/800/800"}
                    alt={p.title}
                    className="aspect-square w-full rounded-xl object-cover"
                  />

                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium">{p.title}</div>
                      <div className="mt-1 text-sm text-gray-600">
                        {(p.price / 100).toFixed(2)} ₽
                      </div>
                    </div>

                    <span className={`text-xs ${inStock ? "text-green-600" : "text-red-600"}`}>
                      {inStock ? "В наличии" : "Нет"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
