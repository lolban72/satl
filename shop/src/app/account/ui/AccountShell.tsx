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

function LogoutButton() {
  return (
    <form action="/auth/logout" method="POST">
      <button
        type="submit"
        className="block text-[12px] uppercase tracking-[0.02em] transition text-black/45 hover:text-black/80"
      >
        ВЫХОД
      </button>
    </form>
  );
}


export default function AccountShell({
  active,
  children,
}: {
  active: "orders" | "profile" | "address" | "subscriptions";
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1440px] px-[65px] pt-[60px] pb-[140px]">
      <div className="flex items-start gap-[50px]">
        {/* LEFT NAV */}
        <aside className="w-[210px] pt-[160px]">
          <div className="flex flex-col gap-[12px]">
            <NavItem href="/account/orders" active={active === "orders"}>
              ЗАКАЗЫ
            </NavItem>
            <NavItem href="/account/profile" active={active === "profile"}>
              ЛИЧНЫЕ ДАННЫЕ
            </NavItem>
            <NavItem href="/account/address" active={active === "address"}>
              АДРЕС ДОСТАВКИ
            </NavItem>
            <NavItem href="/account/subscriptions" active={active === "subscriptions"}>
              ПОДПИСКИ
            </NavItem>

            <div className="pt-[10px]">
            <LogoutButton />
            </div>
          </div>
        </aside>

        {/* RIGHT */}
        <section className="flex-1 pt-[80px]">
          <div className="mx-auto max-w-[720px]">{children}</div>
        </section>
      </div>
    </div>
  );
}
