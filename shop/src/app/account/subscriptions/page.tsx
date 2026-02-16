import { auth } from "@/auth";
import { redirect } from "next/navigation";
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

export default async function SubscriptionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="mx-auto max-w-[1440px] px-[65px] pt-[60px] pb-[140px]">
      <div className="flex items-center gap-[50px]">
        {/* LEFT NAV */}
        <aside className="w-[210px] pt-[160px]">
          <div className="flex flex-col gap-[12px]">
            <NavItem href="/account/orders">ЗАКАЗЫ</NavItem>
            <NavItem href="/account/profile">ЛИЧНЫЕ ДАННЫЕ</NavItem>
            <NavItem href="/account/address">АДРЕС ДОСТАВКИ</NavItem>
            <NavItem href="/account/subscriptions" active>
              ПОДПИСКИ
            </NavItem>
            <div className="pt-[10px]">
              <NavItem href="/auth/logout">ВЫХОД</NavItem>
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="flex-1 pt-[160px]">
          <div className="text-center italic font-bold text-[16px] text-black/90">
            Подписки
          </div>

          <div className="mt-[20px] text-center text-[13px] text-black/70">
            У вас пока нет активных подписок...
          </div>
        </section>
      </div>
    </div>
  );
}
