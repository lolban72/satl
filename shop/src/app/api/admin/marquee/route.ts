import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache"; // ✅ ДОБАВЬ

async function getOrCreate() {
  let row = await prisma.marqueeSettings.findFirst();
  if (!row) {
    row = await prisma.marqueeSettings.create({
      data: { text: "СКИДКИ 20%", speedSeconds: 10, enabled: true },
    });
  }
  return row;
}

export async function GET() {
  const row = await getOrCreate();
  return NextResponse.json(row);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const text = typeof body.text === "string" ? body.text.trim() : undefined;
  const enabled = typeof body.enabled === "boolean" ? body.enabled : undefined;

  const speedRaw =
    typeof body.speedSeconds === "number"
      ? body.speedSeconds
      : typeof body.speedSeconds === "string"
      ? Number(body.speedSeconds)
      : undefined;

  const speedSeconds =
    speedRaw === undefined ? undefined : Math.max(5, Math.floor(speedRaw));

  if (text !== undefined && text.length < 1) {
    return NextResponse.json({ error: "Текст не может быть пустым" }, { status: 400 });
  }

  const current = await getOrCreate();

  const updated = await prisma.marqueeSettings.update({
    where: { id: current.id },
    data: {
      text: text ?? undefined,
      enabled: enabled ?? undefined,
      speedSeconds: speedSeconds ?? undefined,
    },
  });

  // ✅ ВАЖНО: сброс кэша страниц/лейаута
  revalidatePath("/");
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, settings: updated });
}
