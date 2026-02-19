import crypto from "crypto";

function base64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64urlToString(input: string) {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const s = input.replaceAll("-", "+").replaceAll("_", "/") + pad;
  return Buffer.from(s, "base64").toString("utf8");
}

/**
 * Токен для /start: <payload>.<sig>
 * payload = base64url(JSON)
 * sig = base64url(hmacSHA256(payload, TG_SIGNING_SECRET))
 */
export function signStartToken(data: { userId: string; iat: number }) {
  const secret = process.env.TG_SIGNING_SECRET;
  if (!secret) throw new Error("TG_SIGNING_SECRET is not set");

  const payload = base64url(JSON.stringify(data));
  const sig = base64url(crypto.createHmac("sha256", secret).update(payload).digest());
  return `${payload}.${sig}`;
}

export function verifyStartToken(token: string): { userId: string; iat: number } | null {
  const secret = process.env.TG_SIGNING_SECRET;
  if (!secret) throw new Error("TG_SIGNING_SECRET is not set");

  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expected = base64url(crypto.createHmac("sha256", secret).update(payload).digest());
  // timing-safe сравнение
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;

  try {
    const json = JSON.parse(base64urlToString(payload));
    if (!json?.userId || typeof json.userId !== "string") return null;
    if (!json?.iat || typeof json.iat !== "number") return null;

    // можно добавить срок жизни токена, например 24 часа:
    const maxAgeSec = 24 * 60 * 60;
    if (Math.abs(Date.now() / 1000 - json.iat) > maxAgeSec) return null;

    return { userId: json.userId, iat: json.iat };
  } catch {
    return null;
  }
}

export function makeBotStartLink(token: string) {
  const username = process.env.TELEGRAM_BOT_USERNAME;
  if (!username) throw new Error("TELEGRAM_BOT_USERNAME is not set");
  return `https://t.me/${username}?start=${encodeURIComponent(token)}`;
}

export async function tgSendMessage(chatId: string, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) {
    throw new Error(data?.description || "Telegram sendMessage failed");
  }
  return data;
}

/** 6-значный код */
export function generateVerifyCode() {
  const n = crypto.randomInt(0, 1_000_000);
  return String(n).padStart(6, "0");
}
