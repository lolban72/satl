import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params; // ✅ важно (у тебя params = Promise)

  // Удаляем продукт. Варианты удалятся сами, если у relation onDelete: Cascade
  // (у тебя Variant -> Product onDelete: Cascade уже стоит)
  await prisma.product.delete({ where: { id } });

  // чтобы страницы обновились
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/new");

  return NextResponse.json({ ok: true });
}
