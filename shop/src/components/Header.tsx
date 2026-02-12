import Link from "next/link";
import TopMarquee from "./TopMarquee";
import { prisma } from "@/lib/prisma";
import { Brygada_1918 } from "next/font/google";
import { User, ShoppingBag } from "lucide-react";

const brygada = Brygada_1918({
  subsets: ["latin", "latin-ext"],
  weight: ["500"], // Medium
});

export default async function Header() {
  const categories = await prisma.category.findMany({
    where: {
      showInNav: true,
      products: { some: {} },
    },
    orderBy: [{ navOrder: "asc" }, { title: "asc" }],
  });

  return (
    <div className="sticky top-0 z-50 bg-white text-black">
      <TopMarquee
        text="СКИДКИ 20%"
        speedSeconds={18}
        fontClass={brygada.className}
      />

      <header className="h-[80px] border-b">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-[65px]">
          
          {/* LOGO */}
          <Link
            href="/"
            className="font-bold text-[65px] leading-none tracking-[-0.19em]"
          >
            SATL
          </Link>

          {/* NAVIGATION */}
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

          {/* ICONS */}
          <div className="flex items-center gap-[16px]">
            <Link
              href="/account"
              aria-label="Профиль"
              className="hover:opacity-70 transition"
            >
              <User size={30} strokeWidth={2.5} />
            </Link>

            <Link
              href="/cart"
              aria-label="Корзина"
              className="hover:opacity-70 transition"
            >
              <ShoppingBag size={30} strokeWidth={2.2} />
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}
