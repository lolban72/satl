import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  // ✅ заголовок (name) теперь необязательный и может быть пустым
  name: z.string().optional().nullable(),
});

function gen6() {
  // 100000..999999
  return String(crypto.randomInt(100000, 1000000));
}

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function toNull(v: any) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

export async function POST(req: Request) {
  try {
    const body = Schema.parse(await req.json());
    const email = body.email.toLowerCase().trim();

    const exists = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (exists) {
      return Response.json({ error: "Пользователь уже существует" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    // ✅ TG verify code (10 минут)
    const code = gen6();
    const codeHash = hashCode(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // ✅ создаём пользователя (без tgVerifyCodeHash / tgVerifyExpiresAt — их нет в schema.prisma)
    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: toNull(body.name),
        tgVerifiedAt: null,
        isVerified: false,
        // tgChatId пока не знаем
      },
      select: { id: true, email: true, name: true },
    });

    // ✅ сохраняем код в TgVerification (как у тебя в prisma schema)
    // chatId обязателен, реального chatId пока нет — временно привязываем к userId
    await prisma.tgVerification.create({
      data: {
        chatId: `u:${user.id}`,
        codeHash,
        expiresAt,
      },
    });

    // ✅ временно возвращаем код для теста (потом уберём, когда подключим TG-бота)
    return Response.json({ ok: true, user, devCode: code });
  } catch (e: any) {
    const msg = e?.issues?.[0]?.message || e?.message || "Ошибка регистрации";
    return Response.json({ error: msg }, { status: 400 });
  }
}
