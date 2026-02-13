import { prisma } from "@/lib/prisma";
import AddToCart from "./ui/AddToCart";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: true },
  });

  if (!product) return <div className="p-6">Товар не найден</div>;

  return (
    <div className="mx-auto max-w-5xl p-6 mt-25">
      <div className="grid gap-8 md:grid-cols-2">
        <img
          src={product.images?.[0] ?? "https://picsum.photos/seed/placeholder/800/800"}
          alt={product.title}
          className="w-full rounded-2xl object-cover"
        />

        <div>
          <h1 className="text-3xl font-semibold">{product.title}</h1>
          <div className="mt-2 text-xl font-bold">
            {(product.price / 100).toFixed(2)} ₽
          </div>

          {product.description ? (
            <p className="mt-4 text-gray-600">{product.description}</p>
          ) : null}

          <div className="mt-6">
            <AddToCart
              productId={product.id}
              title={product.title}
              price={product.price}
              image={product.images?.[0] ?? undefined}
              variants={product.variants.map((v) => ({
                id: v.id,
                size: v.size,
                color: v.color,
                stock: v.stock,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
