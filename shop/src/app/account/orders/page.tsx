import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AccountShell from "../ui/AccountShell";

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
    <AccountShell active="orders">
      {orders.length === 0 ? (
        <div className="text-center italic font-bold text-[16px] text-black/90">
          У Вас пока нет заказов...
        </div>
      ) : (
        <div className="space-y-[14px]">
          {orders.map((o) => (
            <div key={o.id} className="border border-black/15 p-[16px]">
              <div className="text-[11px] uppercase tracking-[0.02em] text-black/45">
                {new Date(o.createdAt).toLocaleString("ru-RU")}
              </div>

              <div className="mt-[8px] flex items-center justify-between">
                <div className="text-[13px]">
                  Статус:{" "}
                  <span className="font-semibold text-black">{o.status}</span>
                </div>
                <div className="text-[16px] font-semibold">
                  {(o.total / 100).toFixed(0)}р
                </div>
              </div>

              <div className="mt-[8px] text-[10px] text-black/40 break-all">
                ID: {o.id}
              </div>
            </div>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
