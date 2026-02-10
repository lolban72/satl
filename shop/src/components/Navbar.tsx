import Link from "next/link";
import CartIndicator from "./cart-indicator";
import AuthControls from "./AuthControls";

export default function Navbar() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="text-lg font-semibold">
          Brand Shop
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/#catalog" className="hover:underline">
            Каталог
          </Link>


          <CartIndicator />

          {/* 👇 вот это будет само обновляться */}
          <AuthControls />
        </nav>
      </div>
    </header>
  );
}