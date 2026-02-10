import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Профиль</h1>

      <div className="mt-6 rounded-2xl border p-4">
        <div><span className="text-gray-600">Email:</span> {session.user.email}</div>
        <div className="mt-2"><span className="text-gray-600">Имя:</span> {session.user.name ?? "—"}</div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link className="rounded-xl border px-4 py-2" href="/account/orders">
          Мои заказы
        </Link>
      </div>
    </div>
  );
}
