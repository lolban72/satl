import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function getOrCreate() {
  const existing = await prisma.heroBanner.findFirst({ orderBy: { createdAt: "asc" } });
  if (existing) return existing;

  return prisma.heroBanner.create({
    data: {
      enabled: true,
      title: "Новая коллекция",
      subtitle: "Собери образ на каждый день",
      buttonText: "Смотреть товары",
      buttonHref: "/#catalog",
      overlay: 25,
      imageUrl: null,
    },
  });
}

export async function GET() {
  const banner = await getOrCreate();
  return NextResponse.json(banner);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const banner = await getOrCreate();

  const updated = await prisma.heroBanner.update({
    where: { id: banner.id },
    data: {
      enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
      title: typeof body.title === "string" ? body.title : undefined,
      subtitle: typeof body.subtitle === "string" ? body.subtitle : undefined,
      buttonText: typeof body.buttonText === "string" ? body.buttonText : undefined,
      buttonHref: typeof body.buttonHref === "string" ? body.buttonHref : undefined,
      imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : undefined,
      overlay: typeof body.overlay === "number" ? body.overlay : undefined,
    },
  });

  revalidatePath("/"); // чтобы главная обновилась
  return NextResponse.json(updated);
}
