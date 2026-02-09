"use client";

import Link from "next/link";
import { useCart } from "../lib/cart-store";

export default function Navbar() {
  const items = useCart((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Link href="/" className="text-lg font-semibold">
          Brand Shop
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/catalog" className="hover:underline">
            Каталог
          </Link>

          <Link href="/cart" className="relative hover:underline">
            Корзина
            {count > 0 && (
              <span className="ml-2 inline-flex min-w-[22px] items-center justify-center rounded-full bg-black px-2 py-0.5 text-xs text-white">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
