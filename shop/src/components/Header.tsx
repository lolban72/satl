import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { User, ShoppingBag } from "lucide-react";

export default async function Header({ className = "" }: { className?: string }) {
  const categories = await prisma.category.findMany({
    where: { showInNav: true, products: { some: {} } },
    orderBy: [{ navOrder: "asc" }, { title: "asc" }],
    select: { id: true, title: true, slug: true },
  });

  return (
    <header className={`sticky top-0 z-50 bg-white text-black ${className}`}>
      <div className="mx-auto flex h-[80px] max-w-[1440px] items-center px-[65px]">
        {/* ЛЕВАЯ ГРУППА: ЛОГО + НАВИГАЦИЯ */}
        <div className="flex items-center gap-[100px]">
          {/* LOGO */}
          <Link
            href="/"
            className="font-bold text-[65px] leading-none tracking-[-0.19em]"
          >
            SATL
          </Link>

          {/* NAV */}
          <nav className="hidden md:flex items-center gap-[33px] font-bold text-[15px] uppercase tracking-[-0.02em]">
            {/* ✅ КАТЕГОРИИ (КНОПКА) + DROPDOWN */}
            <div className="relative group">
              <Link href="/#catalog" className="hover:opacity-70 transition">
                Категории
              </Link>

              {/* Выпадающий список: все категории */}
              <div
                className="
                  absolute left-0 top-full z-50 w-[260px]
                  opacity-0 pointer-events-none
                  group-hover:opacity-100 group-hover:pointer-events-auto
                  transition duration-200
                "
              >
                <div className="pt-3">
                  <div className="rounded-2xl border border-black/10 bg-white shadow-xl p-2">
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/#cat-${c.slug}`}
                        className="block rounded-xl px-4 py-2 text-sm hover:bg-black/5 transition"
                      >
                        {c.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* ✅ КАТЕГОРИИ СТРОЧКОЙ — ОСТАВЛЯЕМ */}
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/#cat-${c.slug}`}
                className="hover:opacity-70 transition"
              >
                {c.title}
              </Link>
            ))}

            <Link href="/info" className="hover:opacity-70 transition">
              Информация
            </Link>
          </nav>
        </div>

        {/* ПРАВАЯ ЧАСТЬ (иконки) */}
        <div className="ml-auto flex items-center gap-[16px]">
          <Link href="/account/orders" aria-label="Профиль" className="hover:opacity-70 transition">
            <User size={34} strokeWidth={2} />
          </Link>

          <Link href="/cart" aria-label="Корзина" className="hover:opacity-70 transition">
            <ShoppingBag size={34} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </header>
  );
}
