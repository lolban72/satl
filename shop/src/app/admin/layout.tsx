import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const nav = [
  { href: "/admin", label: "Панель" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/products/new", label: "Добавить товар" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/navigation/header", label: "Порядок в шапке" },
  { href: "/admin/navigation/home", label: "Порядок на главной" },

  // ✅ Маркетинг
  { href: "/admin/marketing/hero", label: "Hero баннер" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="text-xl font-semibold">Админ-панель</div>
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          ← На сайт
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border p-4">
          <div className="text-sm font-semibold">Разделы</div>
          <div className="mt-3 grid gap-2 text-sm">
            {nav.map((i) => (
              <Link key={i.href} href={i.href} className="rounded-xl px-3 py-2 hover:bg-gray-50">
                {i.label}
              </Link>
            ))}
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
