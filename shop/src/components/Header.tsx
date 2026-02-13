import Link from "next/link";
import { prisma } from "@/lib/prisma";

import { User, ShoppingBag } from "lucide-react";

export default async function Header() {
  const categories = await prisma.category.findMany({
    where: { showInNav: true, products: { some: {} } },
    orderBy: [{ navOrder: "asc" }, { title: "asc" }],
  });

  return (
    <>
<header className="sticky top-0 z-50 bg-white text-black">
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
        <Link href="/#catalog" className="hover:opacity-70 transition">
          Категории
        </Link>

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
      <Link href="/account" aria-label="Профиль" className="hover:opacity-70 transition">
        <User size={34} strokeWidth={2} />
      </Link>

      <Link href="/cart" aria-label="Корзина" className="hover:opacity-70 transition">
        <ShoppingBag size={34} strokeWidth={2} />
      </Link>
    </div>

  </div>
</header>

    </>
  );
}
