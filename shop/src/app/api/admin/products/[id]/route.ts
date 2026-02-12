import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json();

  // простая валидация (без zod, чтобы быстро)
  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  const slug = typeof body.slug === "string" ? body.slug.trim() : undefined;

  const priceRub = typeof body.priceRub === "string" ? body.priceRub : undefined;
  const stockStr = typeof body.stock === "string" ? body.stock : undefined;

  const categoryId =
    body.categoryId === null || typeof body.categoryId === "string"
      ? body.categoryId
      : undefined;

  const image =
    typeof body.image === "string" ? body.image : undefined;

  let price: number | undefined = undefined;
  if (priceRub !== undefined) {
    const p = Math.round(Number(priceRub) * 100);
    if (!Number.isFinite(p) || p <= 0) {
      return NextResponse.json({ error: "Некорректная цена" }, { status: 400 });
    }
    price = p;
  }

  let stock: number | undefined = undefined;
  if (stockStr !== undefined) {
    const s = Math.floor(Number(stockStr));
    if (!Number.isFinite(s) || s < 0) {
      return NextResponse.json({ error: "Некорректный stock" }, { status: 400 });
    }
    stock = s;
  }

  // если меняем categoryId — проверим, что категория существует
  if (categoryId && typeof categoryId === "string") {
    const cat = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
    if (!cat) return NextResponse.json({ error: "Категория не найдена" }, { status: 400 });
  }

  // sku/variants: у тебя 1 дефолтный вариант, обновим stock у первого варианта
  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.product.update({
      where: { id },
      data: {
        title: title ?? undefined,
        slug: slug ?? undefined,
        price: price ?? undefined,
        categoryId: categoryId === undefined ? undefined : categoryId, // null тоже разрешаем
        images: image !== undefined ? (image ? [image] : []) : undefined,
      },
      select: { id: true, slug: true },
    });

    if (stock !== undefined) {
      const v = await tx.variant.findFirst({
        where: { productId: id },
        orderBy: { id: "asc" },
        select: { id: true },
      });

      if (v) {
        await tx.variant.update({
          where: { id: v.id },
          data: { stock },
        });
      }
    }

    return p;
  });

  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);

  return NextResponse.json({ ok: true, slug: updated.slug });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  await prisma.product.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/products");

  return NextResponse.json({ ok: true });
}
