import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { newsletterEnabled: true },
  });

  return NextResponse.json({ newsletterEnabled: Boolean(user?.newsletterEnabled) });
}

export async function PATCH(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const newsletterEnabled =
    typeof body.newsletterEnabled === "boolean" ? body.newsletterEnabled : undefined;

  if (newsletterEnabled === undefined) {
    return NextResponse.json({ error: "newsletterEnabled обязателен" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { newsletterEnabled },
    select: { newsletterEnabled: true },
  });

  return NextResponse.json({ ok: true, newsletterEnabled: updated.newsletterEnabled });
}
