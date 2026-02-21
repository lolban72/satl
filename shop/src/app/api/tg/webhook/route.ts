import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { tgSendMessage } from "@/lib/tg";

const TG_WEBHOOK_SECRET = process.env.TG_WEBHOOK_SECRET || "";

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function normalizeCode(text: string) {
  return text.trim().toUpperCase().replace(/\s+/g, "");
}

export async function POST(req: Request) {
  try {
    // ✅ Проверка секрета вебхука от Telegram
    if (TG_WEBHOOK_SECRET) {
      const header = req.headers.get("x-telegram-bot-api-secret-token") || "";
      if (header !== TG_WEBHOOK_SECRET) {
        // всегда 200, чтобы Telegram не ретраил
        return Response.json({ ok: true });
      }
    }

    const update: any = await req.json().catch(() => null);
    if (!update) return Response.json({ ok: true });

    const msg = update?.message || update?.edited_message;
    const chatIdNum = msg?.chat?.id;
    const chatId = chatIdNum ? String(chatIdNum) : null;
    const textRaw = msg?.text ? String(msg.text) : "";

    if (!chatId) return Response.json({ ok: true });

    const username = msg?.from?.username ? String(msg.from.username) : null;

    // /start — просто объясняем что делать
    if (textRaw.trim().toLowerCase().startsWith("/start")) {
      await tgSendMessage(
        chatId,
        "Привет! 👋\n\nЧтобы привязать аккаунт:\n1) Зайди на сайт → Подтверждение Telegram\n2) Сгенерируй код\n3) Отправь этот код мне одним сообщением"
      );
      return Response.json({ ok: true });
    }

    const code = normalizeCode(textRaw);

    // если сообщение не похоже на код — подсказываем
    if (!/^[A-Z0-9]{6,10}$/.test(code)) {
      await tgSendMessage(
        chatId,
        "Отправь мне код, который выдал сайт (обычно 6 символов)."
      );
      return Response.json({ ok: true });
    }

    const codeHash = sha256(code);

    // ищем активный код
    const row = await prisma.tgLinkCode.findFirst({
      where: {
        codeHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, userId: true },
    });

    if (!row) {
      await tgSendMessage(chatId, "Код неверный или истёк. Сгенерируй новый код на сайте.");
      return Response.json({ ok: true });
    }

    await prisma.$transaction(async (tx) => {
      // помечаем код использованным
      await tx.tgLinkCode.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      });

      // привязываем tg к пользователю + подтверждаем аккаунт (если хочешь)
      await tx.user.update({
        where: { id: row.userId },
        data: {
          tgChatId: chatId,
          tgUsername: username,
          tgLinkedAt: new Date(),
          tgVerifiedAt: new Date(),
          isVerified: true,
        },
      });

      // чистим остальные неиспользованные коды этого пользователя
      await tx.tgLinkCode.deleteMany({
        where: { userId: row.userId, usedAt: null },
      });
    });

    await tgSendMessage(chatId, "Аккаунт привязан ✅");
    return Response.json({ ok: true });
  } catch (e: any) {
    // всегда 200, чтобы Telegram не ретраил бесконечно
    return Response.json({ ok: true });
  }
}