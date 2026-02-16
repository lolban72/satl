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

function Field({
  label,
  value,
  type = "text",
}: {
  label: string;
  value?: string | null;
  type?: string;
}) {
  return (
    <label className="block">
      <div className="mb-[6px] font-semibold text-[8px] text-black/70">
        {label}
      </div>
      <input
        type={type}
        defaultValue={value ?? ""}
        className="h-[35px] w-[330px] border border-black/15 px-[10px] font-semibold text-[12px] outline-none focus:border-black/40"
      />
    </label>
  );
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const firstName = session.user.name ?? "";
  const lastName = (session.user as any).lastName ?? "";
  const country = (session.user as any).country ?? "Российская Федерация";
  const phone = (session.user as any).phone ?? "";
  const email = session.user.email ?? "";

  return (
    <div className="mx-auto max-w-[1440px] px-[65px] pt-[60px] pb-[140px]">
      <div className="flex items-center gap-[50px]">
        {/* LEFT NAV */}
        <aside className="w-[210px] pt-[160px]">
          <div className="flex flex-col gap-[12px]">
            <NavItem href="/account/orders">ЗАКАЗЫ</NavItem>
            <NavItem href="/account/profile" active>
              ЛИЧНЫЕ ДАННЫЕ
            </NavItem>
            <NavItem href="/account/address">АДРЕС ДОСТАВКИ</NavItem>
            <NavItem href="/account/subscriptions">ПОДПИСКИ</NavItem>
            <div className="pt-[10px]">
              <NavItem href="/auth/logout">ВЫХОД</NavItem>
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="flex-1 pt-[160px] flex justify-center">
          <div className="flex flex-col items-center">
            {/* Заголовок */}
            <div className="font-semibold italic text-[20px] text-black">
              Личные данные
            </div>

            {/* Поля */}
            <div className="mt-[20px] flex flex-col gap-[14px]">
              <Field label="Имя" value={firstName} />
              <Field label="Фамилия" value={lastName} />
              <Field label="Страна" value={country} />
              <Field label="Телефон" value={phone} />
              <Field label="E-mail" value={email} type="email" />
            </div>

            {/* Безопасность */}
            <div className="mt-[28px] flex flex-col items-center">
              <div className="font-semibold italic text-[20px] text-black">
                Безопасность
              </div>

              <Link
                href="/account/change-password"
                className="mt-[12px] h-[30px] w-[180px] bg-black text-white flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.12em] hover:bg-black/85 transition"
              >
                Сменить пароль
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
