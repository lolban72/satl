import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

function Row({
  title,
  right,
  href,
}: {
  title: string;
  right?: React.ReactNode;
  href?: string;
}) {
  const Comp: any = href ? Link : "div";
  const props = href ? { href } : {};

  return (
    <Comp
      {...props}
      className={[
        "w-full max-w-[720px]",
        "border-b border-black/10",
        "py-[18px]",
        href ? "cursor-pointer hover:bg-black/[0.02] transition" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-6">
        <div className="font-semibold text-[14px] text-black/90">{title}</div>
        <div className="text-[13px] text-black/60">{right}</div>
      </div>
    </Comp>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="w-full max-w-[720px] py-[10px] border-b border-black/10">
      <div className="mb-[6px] font-semibold text-[8px] text-black/55">
        {label}
      </div>
      <div className="font-semibold text-[12px] text-black/85">{value ?? "—"}</div>
    </div>
  );
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  // если полей нет — будет "—"
  const addressLine =
    (session.user as any).addressLine ??
    (session.user as any).address ??
    null;

  const phone = (session.user as any).phone ?? null;

  return (
    <div className="mx-auto max-w-[1440px] px-[65px] pt-[60px] pb-[140px]">
      <div className="flex flex-col items-center">
        {/* 1) МОИ ЗАКАЗЫ — первым блоком */}
        <Row
          title="Мои заказы"
          right="Открыть"
          href="/account/orders"
        />

        {/* 2) АДРЕС ДОСТАВКИ */}
        <Row
          title="Адрес доставки"
          right={addressLine ? addressLine : "Не указан"}
          href="/account/address"
        />

        {/* 3) ЛИЧНЫЕ ДАННЫЕ */}
        <div className="w-full max-w-[720px] pt-[26px] pb-[6px]">
          <div className="font-semibold italic text-[20px] text-black text-center">
            Личные данные
          </div>
        </div>

        <Field label="Имя" value={session.user.name ?? "—"} />
        <Field label="Телефон" value={phone ?? "—"} />
        <Field label="E-mail" value={session.user.email ?? "—"} />

        {/* 4) СМЕНА ПАРОЛЯ */}
        <div className="w-full max-w-[720px] pt-[28px] flex flex-col items-center">
          <div className="font-semibold italic text-[20px] text-black text-center">
            Безопасность
          </div>

          <Link
            href="/account/change-password"
            className="mt-[12px] h-[30px] w-[180px] bg-black text-white flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.12em] hover:bg-black/85 transition"
          >
            Сменить пароль
          </Link>
        </div>

        {/* 5) ВЫХОД */}
        <div className="w-full max-w-[720px] pt-[28px]">
          <Link
            href="/auth/logout"
            className="block text-center text-[12px] uppercase tracking-[0.08em] text-black/60 hover:text-black transition"
          >
            Выход
          </Link>
        </div>
      </div>
    </div>
  );
}
