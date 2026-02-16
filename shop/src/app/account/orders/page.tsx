import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function NavItem({
  href,
  children,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "block text-[12px] uppercase tracking-[0.02em] transition",
        active ? "text-black font-bold" : "text-black/45 hover:text-black/80",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

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
    <div className="mx-auto max-w-[1440px] px-[65px] pt-[60px] pb-[140px]">
      <div className="flex items-center gap-[50px]">
        {/* LEFT NAV */}
        <aside className="w-[210px] pt-[160px]">
          <div className="flex flex-col gap-[12px]">
            <NavItem href="/account/orders" active>
              ЗАКАЗЫ
            </NavItem>
            <NavItem href="/account/profile">ЛИЧНЫЕ ДАННЫЕ</NavItem>
            <NavItem href="/account/address">АДРЕС ДОСТАВКИ</NavItem>
            <NavItem href="/account/subscriptions">ПОДПИСКИ</NavItem>
            <div className="pt-[10px]">
              <NavItem href="/auth/logout">ВЫХОД</NavItem>
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="flex-1 pt-[160px]">
          {orders.length === 0 ? (
            <div className="text-center italic font-bold text-[16px] text-black/90">
              У Вас пока нет заказов...
            </div>
          ) : (
            <div className="mx-auto max-w-[720px] space-y-[14px]">
              {orders.map((o) => (
                <div key={o.id} className="border border-black/15 p-[16px]">
                  <div className="text-[11px] uppercase tracking-[0.02em] text-black/45">
                    {new Date(o.createdAt).toLocaleString("ru-RU")}
                  </div>

                  <div className="mt-[8px] flex items-center justify-between">
                    <div className="text-[13px]">
                      Статус: <span className="font-semibold text-black">{o.status}</span>
                    </div>
                    <div className="text-[16px] font-semibold">
                      {(o.total / 100).toFixed(0)} ₽
                    </div>
                  </div>

                  <div className="mt-[8px] text-[10px] text-black/40 break-all">
                    ID: {o.id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
