import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";


const BodySchema = z.object({
  customer: z.object({
    name: z.string().min(2, "Имя слишком короткое"),
    phone: z.string().min(5, "Телефон слишком короткий"),
    address: z.string().min(5, "Адрес слишком короткий"),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional(),
        qty: z.coerce.number().int().min(1).max(99),
      })
    )
    .min(1),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id as string | undefined;

    const body = BodySchema.parse(await req.json());

    const detailedItems: {
      productId: string;
      variantId?: string;
      title: string;
      price: number;
      quantity: number;
      variant?: { id: string; stock: number };
    }[] = [];

    let total = 0;

    for (const i of body.items) {
      const product = await prisma.product.findUnique({
        where: { id: i.productId },
        include: { variants: true },
      });

      if (!product) {
        return Response.json({ error: "Товар не найден" }, { status: 400 });
      }

      const variant = i.variantId
        ? product.variants.find((v: { id: string | undefined; }) => v.id === i.variantId)
        : undefined;

      if (i.variantId && !variant) {
        return Response.json({ error: "Вариант товара не найден" }, { status: 400 });
      }

      if (variant && variant.stock < i.qty) {
        return Response.json(
          { error: `Недостаточно на складе: ${product.title}` },
          { status: 400 }
        );
      }

      total += product.price * i.qty;

      detailedItems.push({
        productId: product.id,
        variantId: variant?.id,
        title: product.title,
        price: product.price,
        quantity: i.qty,
        variant: variant ? { id: variant.id, stock: variant.stock } : undefined,
      });
    }

    const order = await prisma.$transaction(async (tx: {
      user: any; order: { create: (arg0: { data: { total: number; name: string; phone: string; address: string; userId: string | null; items: { create: { productId: string; variantId: string | undefined; title: string; price: number; quantity: number; }[]; }; }; select: { id: boolean; }; }) => any; }; variant: { update: (arg0: { where: { id: string; }; data: { stock: { decrement: number; }; }; }) => any; }; 
}) => {
      const created = await tx.order.create({
        data: {
          total,
          name: body.customer.name,
          phone: body.customer.phone,
          address: body.customer.address,
          userId: userId ?? null,
          items: {
            create: detailedItems.map((i) => ({
              productId: i.productId,
              variantId: i.variantId,
              title: i.title,
              price: i.price,
              quantity: i.quantity,
            })),
          },
        },
        select: { id: true },
      });

      if (userId) {
        await tx.user.update({
          where: { id: userId },
          data: {
            name: body.customer.name,
            phone: body.customer.phone,
            address: body.customer.address,
          },
        });
      }


      for (const i of detailedItems) {
        if (i.variantId) {
          await tx.variant.update({
            where: { id: i.variantId },
            data: { stock: { decrement: i.quantity } },
          });
        }
      }

      return created;
    });

    return Response.json({ ok: true, orderId: order.id });
  } catch (e: any) {
    const msg =
      e?.issues?.[0]?.message ||
      e?.message ||
      "Ошибка обработки заказа";
    return Response.json({ error: msg }, { status: 400 });
  }
}
