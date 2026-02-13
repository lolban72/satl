import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const Schema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  priceRub: z.string().min(1),
  image: z.string().optional(),
  stock: z.string().min(1),
  isSoon: z.boolean().optional(),
  categoryId: z.string().nullable().optional(), // ✅
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = Schema.parse(await req.json());

    const isSoon = Boolean(body.isSoon);
    if (isSoon) {
      if (!body.image) {
        return Response.json({ error: "Для режима 'Скоро' нужно загрузить фото" }, { status: 400 });
      }
    }


    const price = isSoon ? 0 : Math.round(Number(body.priceRub) * 100);
    if (!isSoon) {
      if (!Number.isFinite(price) || price <= 0) {
        return Response.json({ error: "Некорректная цена" }, { status: 400 });
      }
    }

    const stock = isSoon ? 0 : Math.floor(Number(body.stock));
    if (!isSoon) {
      if (!Number.isFinite(stock) || stock < 0) {
        return Response.json({ error: "Некорректный stock" }, { status: 400 });
      }
    }


    const existing = await prisma.product.findUnique({
      where: { slug: body.slug },
      select: { id: true },
    });
    if (existing) {
      return Response.json({ error: "Slug уже занят" }, { status: 400 });
    }

    // ✅ проверка категории (опционально)
    if (body.categoryId) {
      const cat = await prisma.category.findUnique({
        where: { id: body.categoryId },
        select: { id: true },
      });
      if (!cat) {
        return Response.json({ error: "Категория не найдена" }, { status: 400 });
      }
    }

    const sku = `${body.slug}-one-default-${Date.now()}`.toUpperCase();

    const created = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          title: body.title,
          slug: body.slug,
          price,
          images: body.image ? [body.image] : [],
          isSoon,
          categoryId: body.categoryId ?? null, // ✅
        },
        select: { id: true, slug: true },
      });

      await tx.variant.create({
        data: {
          productId: p.id,
          sku,
          size: "one",
          color: "default",
          stock,
        },
      });

      return p;
    });

    return Response.json({ ok: true, slug: created.slug });
  } catch (e: any) {
    const msg = e?.issues?.[0]?.message || e?.message || "Ошибка";
    return Response.json({ error: msg }, { status: 400 });
  }
}
