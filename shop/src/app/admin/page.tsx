import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [productsCount, categoriesCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
  ]);

  // Hero
  let heroCount: number | null = null;
  try {
    heroCount = await prisma.heroBanner.count();
  } catch {
    heroCount = null;
  }

  // ✅ Marquee (бегущая строка)
  let marqueeCount: number | null = null;
  try {
    marqueeCount = await prisma.marqueeSettings.count();
  } catch {
    marqueeCount = null;
  }

  const cards = [
    {
      title: "Товары",
      desc: "Добавление, редактирование, удаление товаров.",
      links: [
        { href: "/admin/products", label: "Список товаров" },
        { href: "/admin/products/new", label: "Добавить товар" },
      ],
    },
    {
      title: "Категории",
      desc: "Добавление, редактирование, удаление категорий.",
      links: [{ href: "/admin/categories", label: "Управление категориями" }],
    },
    {
      title: "Навигация",
      desc: "Порядок категорий отдельно для шапки и главной.",
      links: [
        { href: "/admin/navigation/header", label: "Порядок в шапке" },
        { href: "/admin/navigation/home", label: "Порядок на главной" },
      ],
    },
    {
      title: "Маркетинг",
      desc: "Hero-баннер на главной (текст, кнопка, фон, включение).",
      links: [{ href: "/admin/marketing/hero", label: "Hero баннер" }],
    },
    {
      title: "Бегущая строка",
      desc: "Текст, скорость и включение бегущей строки в шапке сайта.",
      links: [{ href: "/admin/marquee", label: "Управление строкой" }],
    },
  ];

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border p-4">
        <div className="text-lg font-semibold">Сводка</div>
        <div className="mt-2 text-sm text-gray-600">
          Товаров: <b>{productsCount}</b> · Категорий: <b>{categoriesCount}</b>
          {heroCount !== null ? (
            <>
              {" "}· Hero баннеров: <b>{heroCount}</b>
            </>
          ) : null}
          {marqueeCount !== null ? (
            <>
              {" "}· Бегущая строка: <b>{marqueeCount}</b>
            </>
          ) : null}
        </div>

        {heroCount === null ? (
          <div className="mt-2 text-xs text-gray-500">
            HeroBanner ещё не подключён в Prisma — пункт меню добавлен, но счётчик скрыт.
          </div>
        ) : null}

        {marqueeCount === null ? (
          <div className="mt-2 text-xs text-gray-500">
            MarqueeSettings ещё не подключён в Prisma — примените миграцию.
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((c) => (
          <div key={c.title} className="rounded-2xl border p-4">
            <div className="text-lg font-semibold">{c.title}</div>
            <div className="mt-1 text-sm text-gray-600">{c.desc}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {c.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
