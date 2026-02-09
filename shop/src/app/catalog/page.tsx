import Link from "next/link";
import { prisma } from "../../lib/prisma";
import AddToCartCardButton from "./ui/AddToCartCardButton";


export default async function CatalogPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      images: true,
      variants: { select: { id: true, stock: true } },
    },
  });


  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">Каталог</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.slug}`}
            className="rounded-2xl border p-4 hover:shadow"
          >
            {/* картинка */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.images?.[0] ?? "https://picsum.photos/seed/placeholder/800/800"}
              alt={p.title}
              className="h-56 w-full rounded-xl object-cover"
            />
            <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium">{p.title}</div>
                  <div className="mt-1 text-sm text-gray-600">
                    {(p.price / 100).toFixed(2)} ₽
                  </div>
                </div>

                <AddToCartCardButton
                  productId={p.id}
                  slug={p.slug}
                  title={p.title}
                  price={p.price}
                  image={p.images?.[0]}
                  variants={p.variants}
                />
              </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
