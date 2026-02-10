import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function OrdersPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect("/auth/login");

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, total: true, status: true, createdAt: true },
  });

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Мои заказы</h1>

      <div className="mt-6 space-y-3">
        {orders.length === 0 ? (
          <p className="text-gray-600">Заказов пока нет.</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="rounded-2xl border p-4">
              <div className="font-mono text-sm">{o.id}</div>
              <div className="mt-2 text-sm text-gray-600">
                {new Date(o.createdAt).toLocaleString("ru-RU")}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm">Статус: <b>{o.status}</b></div>
                <div className="font-semibold">{(o.total / 100).toFixed(2)} ₽</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6">
        <Link className="underline" href="/account">Назад в профиль</Link>
      </div>
    </div>
  );
}
