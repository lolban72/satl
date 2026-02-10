import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCreateForm from "./ui/ProductCreateForm";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { variants: true },
  });

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold">Админка — товары</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <h2 className="text-lg font-semibold">Добавить товар</h2>
          <ProductCreateForm />
          <p className="mt-3 text-sm text-gray-600">
            Пока создаём товар + один вариант (size/color можно оставить пустыми).
          </p>
        </div>

        <div className="rounded-2xl border p-4">
          <h2 className="text-lg font-semibold">Существующие товары</h2>

          {products.length === 0 ? (
            <p className="mt-3 text-gray-600">Товаров пока нет.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {products.map((p) => {
                const stock = p.variants.reduce((s, v) => s + v.stock, 0);
                return (
                  <div key={p.id} className="rounded-xl border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium">{p.title}</div>
                        <div className="text-sm text-gray-600">
                          /product/{p.slug}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{(p.price / 100).toFixed(2)} ₽</div>
                        <div className="text-sm text-gray-600">stock: {stock}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
