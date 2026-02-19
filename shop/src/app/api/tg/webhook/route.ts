import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateVerifyCode, tgSendMessage, verifyStartToken } from "@/lib/tg";

function getChatId(update: any): string | null {
  const chatId =
    update?.message?.chat?.id ??
    update?.callback_query?.message?.chat?.id ??
    null;
  return chatId !== null && chatId !== undefined ? String(chatId) : null;
}

function getText(update: any): string {
  return String(update?.message?.text ?? "");
}

export async function POST(req: Request) {
  // ✅ проверяем секрет вебхука
  const expected = process.env.TG_WEBHOOK_SECRET;
  const got = req.headers.get("x-telegram-bot-api-secret-token") || "";

  if (!expected) {
    return Response.json({ ok: false, error: "TG_WEBHOOK_SECRET not set" }, { status: 500 });
  }
  if (got !== expected) {
    return Response.json({ ok: false, error: "Bad secret token" }, { status: 401 });
  }

  const update = await req.json().catch(() => null);
  if (!update) return Response.json({ ok: true });

  const chatId = getChatId(update);
  const text = getText(update).trim();

  // мы обязаны быстро отвечать 200, но тут логика лёгкая — ок
  try {
    if (!chatId) return Response.json({ ok: true });

    // /start <payload>
    if (text.startsWith("/start")) {
      const parts = text.split(" ");
      const token = parts[1] ? String(parts[1]).trim() : "";

      if (!token) {
        await tgSendMessage(
          chatId,
          "Откройте бота через ссылку с сайта, чтобы привязать аккаунт."
        );
        return Response.json({ ok: true });
      }

      const verified = verifyStartToken(token);
      if (!verified) {
        await tgSendMessage(chatId, "Ссылка устарела или неверная. Откройте подтверждение на сайте ещё раз.");
        return Response.json({ ok: true });
      }

      const { userId } = verified;

      // ✅ проверим, что chatId не занят другим пользователем
      const already = await prisma.user.findFirst({
        where: { tgChatId: chatId },
        select: { id: true, email: true },
      });

      if (already && already.id !== userId) {
        await tgSendMessage(chatId, "Этот Telegram уже привязан к другому аккаунту.");
        return Response.json({ ok: true });
      }

      // ✅ проверим, что пользователь существует
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, tgChatId: true },
      });

      if (!user) {
        await tgSendMessage(chatId, "Аккаунт не найден. Зарегистрируйтесь на сайте заново.");
        return Response.json({ ok: true });
      }

      // ✅ генерим код, хешируем, пишем в юзера
      const code = generateVerifyCode();
      const hash = await bcrypt.hash(code, 10);
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

      await prisma.user.update({
        where: { id: userId },
        data: {
          tgChatId: chatId,
          tgVerifyCodeHash: hash,
          tgVerifyExpiresAt: expires,
        },
      });

      await tgSendMessage(
        chatId,
        `Ваш код подтверждения: <b>${code}</b>\n\nВведите его на сайте. Код действует 10 минут.`
      );

      return Response.json({ ok: true });
    }

    // любые другие сообщения
    await tgSendMessage(
      chatId,
      "Чтобы подтвердить аккаунт, откройте страницу подтверждения на сайте и перейдите в бота по ссылке."
    );
    return Response.json({ ok: true });
  } catch (e: any) {
    // Telegram будет ретраить, если не 200, поэтому всегда 200
    return Response.json({ ok: true, error: e?.message || "error" });
  }
}
