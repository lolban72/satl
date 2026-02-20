import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const Schema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(12),
});

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = Schema.parse(await req.json());
    const email = body.email.toLowerCase().trim();
    const code = body.code.trim();

    const codeHash = hashCode(code);

    // 1) ищем запись с кодом
    const ver = await prisma.tgVerification.findUnique({
      where: { codeHash },
      select: { id: true, expiresAt: true },
    });

    if (!ver) {
      console.log("[verify] Invalid code");
      return Response.json({ error: "Неверный код" }, { status: 400 });
    }

    if (ver.expiresAt.getTime() < Date.now()) {
      console.log("[verify] Code expired");
      // просроченный код — чистим
      await prisma.tgVerification.delete({ where: { id: ver.id } }).catch(() => {});
      return Response.json({ error: "Код просрочен" }, { status: 400 });
    }

    // 2) находим пользователя по email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, isVerified: true },
    });

    if (!user) {
      console.log("[verify] User not found");
      return Response.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    if (user.isVerified) {
      console.log("[verify] User already verified");
      // уже подтверждён — можно просто удалить код
      await prisma.tgVerification.delete({ where: { id: ver.id } }).catch(() => {});
      return Response.json({ ok: true, alreadyVerified: true });
    }

    // 3) подтверждаем пользователя
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        tgVerifiedAt: new Date(),
      },
    });

    // 4) удаляем использованный код
    await prisma.tgVerification.delete({ where: { id: ver.id } });

    console.log("[verify] User successfully verified");

    return Response.json({ ok: true });
  } catch (e: any) {
    const msg = e?.issues?.[0]?.message || e?.message || "Ошибка подтверждения";
    console.log("[verify] Error:", msg);
    return Response.json({ error: msg }, { status: 400 });
  }
}