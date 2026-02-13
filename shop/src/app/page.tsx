import Link from "next/link";
import { prisma } from "@/lib/prisma";
import HeroBanner from "@/components/HeroBanner";
import ProductCard from "@/components/ProductCard";
import TopMarquee from "@/components/TopMarquee";
import { Brygada_1918 } from "next/font/google";
import Header from "@/components/Header";


  const brygada = Brygada_1918({
    subsets: ["latin", "latin-ext"],
    weight: ["500"],
  });


export default async function HomePage() {
  const banner = await prisma.heroBanner.findFirst({ orderBy: { createdAt: "asc" } });


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

      <HeroBanner banner={banner} />

      <section id="catalog" className="mx-auto max-w-6xl p-6">
        {categories.length === 0 ? (
          <p className="mt-4 text-gray-600">Пока нет категорий с товарами.</p>
        ) : (
          <div className="mt-6 grid gap-10">
            {categories.map((cat) => (
              <section key={cat.id} id={`cat-${cat.slug}`} className="scroll-mt-24">

                {cat.products.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-600">В этой категории пока нет товаров.</p>
                ) : (
                  <div className="mt-6 grid justify-center justify-items-center gap-x-[300px] gap-y-[80px]
                grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {cat.products.map((p) => (
                      <ProductCard
                        key={p.id}
                        slug={p.slug}
                        title={p.title}
                        price={p.price}
                        imageUrl={p.images?.[0] ?? null}
                        isSoon={p.isSoon}
                      />
                    ))}
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
