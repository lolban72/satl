import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    where: {
      showOnHome: true,
      products: { some: {} },
    },
    orderBy: [{ homeOrder: "asc" }, { title: "asc" }],
    include: {
      products: {
        orderBy: { createdAt: "desc" },
        include: { variants: true },
      },
    },
  });



  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl p-6">
        <div className="rounded-3xl border p-8">
          <h1 className="text-4xl font-semibold">Новая коллекция</h1>
          <p className="mt-3 text-gray-600">
            Минимальный hero-блок. Кнопка “Категории” в шапке ведёт к каталогу ниже.
          </p>
          <div className="mt-6">
            <Link href="/#catalog" className="rounded-xl bg-black px-4 py-2 text-white">
              Смотреть товары
            </Link>
          </div>
        </div>
      </section>

      {/* Каталог */}
      <section id="catalog" className="mx-auto max-w-6xl p-6">

        {categories.length === 0 ? (
          <p className="mt-4 text-gray-600">Пока нет категорий с товарами.</p>
        ) : (
          <div className="mt-6 grid gap-10">
            {categories.map((cat) => (
              <section key={cat.id} id={`cat-${cat.slug}`} className="scroll-mt-24">
                <div className="flex items-end justify-between gap-3">
                  <h3 className="text-xl font-semibold uppercase">{cat.title}</h3>
                </div>

                {cat.products.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-600">В этой категории пока нет товаров.</p>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {cat.products.map((p) => {
                      const inStock = p.variants.some((v) => v.stock > 0);
                      return (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug}`}
                          className="rounded-2xl border p-4 transition hover:shadow-sm"
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
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
