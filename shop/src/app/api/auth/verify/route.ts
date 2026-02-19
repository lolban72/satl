import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const Schema = z.object({
  code: z.string().min(4).max(12),
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = Schema.parse(await req.json());
    const code = body.code.trim();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        tgVerifyCodeHash: true,
        tgVerifyExpiresAt: true,
        tgChatId: true,
      },
    });

    if (!user) return Response.json({ error: "User not found" }, { status: 404 });
    if (!user.tgChatId) return Response.json({ error: "Telegram ещё не привязан. Откройте бота по ссылке." }, { status: 400 });

    if (!user.tgVerifyCodeHash || !user.tgVerifyExpiresAt) {
      return Response.json({ error: "Код не запрошен. Откройте бота и нажмите Start." }, { status: 400 });
    }

    if (user.tgVerifyExpiresAt.getTime() < Date.now()) {
      return Response.json({ error: "Код истёк. Откройте бота ещё раз и получите новый." }, { status: 400 });
    }

    const ok = await bcrypt.compare(code, user.tgVerifyCodeHash);
    if (!ok) return Response.json({ error: "Неверный код" }, { status: 400 });

    await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        tgVerifiedAt: new Date(),
        tgVerifyCodeHash: null,
        tgVerifyExpiresAt: null,
      },
    });

    return Response.json({ ok: true });
  } catch (e: any) {
    const msg = e?.issues?.[0]?.message || e?.message || "Ошибка";
    return Response.json({ error: msg }, { status: 400 });
  }
}
