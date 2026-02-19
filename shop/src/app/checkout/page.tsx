import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "./ui/CheckoutForm";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  // ✅ если нужно оформлять только авторизованным — раскомментируй
  // if (!userId) redirect("/auth/login?next=/checkout");

  const defaults = userId
    ? await prisma.user
        .findUnique({
          where: { id: userId },
          select: { name: true, phone: true, address: true, email: true },
        })
        .then((user) => ({
          name: user?.name ?? user?.email ?? "",
          phone: user?.phone ?? "",
          address: user?.address ?? "",
        }))
    : { name: "", phone: "", address: "" };

  return <CheckoutForm initial={defaults} />;
}
