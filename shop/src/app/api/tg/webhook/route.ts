import { prisma } from "@/lib/prisma";
import { verifyStartToken, generateVerifyCode, tgSendMessage } from "@/lib/tg";
import { hashCode } from "@/lib/tg-verify";

const TG_WEBHOOK_SECRET = process.env.TG_WEBHOOK_SECRET || "";

function extractStartPayload(text: string) {
  const t = (text || "").trim();
  if (!t.toLowerCase().startsWith("/start")) return null;
  const parts = t.split(/\s+/);
  if (parts.length < 2) return null;
  return parts.slice(1).join(" ").trim();
}

export async function POST(req: Request) {
  try {
    // Проверка секрета вебхука от Telegram
    if (TG_WEBHOOK_SECRET) {
      const header = req.headers.get("x-telegram-bot-api-secret-token") || "";
      if (header !== TG_WEBHOOK_SECRET) {
        console.log("[tg] Invalid secret token", { received: header, expected: TG_WEBHOOK_SECRET });
        // Всегда 200, чтобы Telegram не ретраил
        return Response.json({ ok: true });
      }
    }

    const update: any = await req.json().catch((e) => {
      console.error("[tg] Error parsing update:", e);
      return null;
    });
    
    if (!update) {
      return Response.json({ ok: false, error: "Failed to parse update" });
    }

    const msg = update?.message || update?.edited_message;
    const chatId = msg?.chat?.id ? String(msg.chat.id) : null;
    const text = msg?.text ? String(msg.text) : "";

    if (!chatId) {
      console.log("[tg] No chatId in message");
      return Response.json({ ok: true });
    }

    // Лог для проверки, что апдейты реально приходят
    console.log("[tg] incoming update:", { chatId, text });

    const token = extractStartPayload(text);

    // Любые другие сообщения
    if (!token) {
      await tgSendMessage(
        chatId,
        "Чтобы подтвердить аккаунт, откройте страницу подтверждения на сайте и перейдите в бота по ссылке."
      );
      return Response.json({ ok: true });
    }

    // Проверяем и декодируем токен
    const decoded = verifyStartToken(token);
    const userId = decoded?.userId;

    if (!userId) {
      console.log("[tg] Invalid or expired token", { token });
      await tgSendMessage(
        chatId,
        "Ссылка устарела или неверная. Откройте страницу подтверждения на сайте и получите новую ссылку."
      );
      return Response.json({ ok: true });
    }

    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, tgChatId: true, isVerified: true },
    });

    if (!user) {
      console.log("[tg] User not found", { userId });
      await tgSendMessage(chatId, "Аккаунт не найден. Зарегистрируйтесь на сайте заново.");
      return Response.json({ ok: true });
    }

    // Если пользователь уже подтверждён — привязываем chatId и отправляем сообщение
    if (user.isVerified) {
      await prisma.user.update({
        where: { id: userId },
        data: { tgChatId: chatId },
      });
      await tgSendMessage(chatId, "Аккаунт уже подтверждён ✅");
      return Response.json({ ok: true });
    }

    // Генерация кода подтверждения
    const code = generateVerifyCode();
    const codeHash = hashCode(`${userId}:${code}`);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Код действует 10 минут

    // Обновление chatId в базе
    await prisma.user.update({
      where: { id: userId },
      data: { tgChatId: chatId },
    });

    // Сохранение verification в базе данных
    await prisma.tgVerification.upsert({
      where: { codeHash },
      update: { chatId, expiresAt },
      create: { chatId, codeHash, expiresAt },
    });

    // Отправляем код подтверждения пользователю
    await tgSendMessage(
      chatId,
      `Ваш код подтверждения: <b>${code}</b>\n\nВведите его на сайте. Код действует 10 минут.`
    );

    return Response.json({ ok: true });
  } catch (e: any) {
    console.error("[tg] Error processing request:", e?.message || e);
    return Response.json({ ok: false, error: e?.message || "Internal error" });
  }
}