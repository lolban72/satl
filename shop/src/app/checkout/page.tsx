import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "./ui/CheckoutForm";

export default async function CheckoutPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  let defaults = { name: "", phone: "", address: "" };

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, phone: true, address: true, email: true },
    });

    defaults = {
      name: user?.name ?? user?.email ?? "",
      phone: user?.phone ?? "",
      address: user?.address ?? "",
    };
  }

  return <CheckoutForm initial={defaults} />;
}
