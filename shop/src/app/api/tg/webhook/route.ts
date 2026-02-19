import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Telegram присылает secret-token в заголовке, если ты его задал при setWebhook
const TG_WEBHOOK_SECRET = process.env.TG_WEBHOOK_SECRET || "";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

function generateVerifyCode() {
  // 100000..999999
  return String(crypto.randomInt(100000, 1000000));
}

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

async function tgSendMessage(chatId: string, text: string) {
  if (!BOT_TOKEN) return;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  }).catch(() => {});
}

/**
 * Ожидаем /start <payload>, где payload = userId
 * Например: /start ckx... (cuid)
 */
function extractStartPayload(text: string) {
  const t = (text || "").trim();
  if (!t.toLowerCase().startsWith("/start")) return null;

  // "/start" or "/start payload"
  const parts = t.split(/\s+/);
  if (parts.length < 2) return null;

  return parts.slice(1).join(" ").trim();
}

export async function POST(req: Request) {
  try {
    // ✅ проверка secret token (если используешь)
    if (TG_WEBHOOK_SECRET) {
      const header = req.headers.get("x-telegram-bot-api-secret-token") || "";
      if (header !== TG_WEBHOOK_SECRET) {
        // Telegram будет ретраить, если не 200, поэтому отвечаем 200, но игнорируем
        return Response.json({ ok: true });
      }
    }

    if (!BOT_TOKEN) {
      // чтобы Telegram не ретраил
      return Response.json({ ok: true, error: "No TELEGRAM_BOT_TOKEN" });
    }

    const update: any = await req.json().catch(() => null);
    const msg = update?.message || update?.edited_message;
    const chatId = msg?.chat?.id ? String(msg.chat.id) : null;
    const text = msg?.text ? String(msg.text) : "";

    if (!chatId) return Response.json({ ok: true });

    // ✅ /start payload
    const payload = extractStartPayload(text);

    if (payload) {
      // В payload ожидаем userId (cuid). Если у тебя другой формат — скажи, подправлю.
      const userId = payload;

      // ✅ проверим, что пользователь существует
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, tgChatId: true },
      });

      if (!user) {
        await tgSendMessage(chatId, "Аккаунт не найден. Зарегистрируйтесь на сайте заново.");
        return Response.json({ ok: true });
      }

      // ✅ генерим код, хэшируем, пишем в TgVerification
      const code = generateVerifyCode();
      const codeHash = sha256(code);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

      // 1) сохраняем chatId у пользователя
      await prisma.user.update({
        where: { id: userId },
        data: { tgChatId: chatId },
      });

      // 2) сохраняем код в TgVerification (как в schema.prisma)
      await prisma.tgVerification.upsert({
        where: { codeHash },
        update: { chatId, expiresAt },
        create: { chatId, codeHash, expiresAt },
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
