import crypto from "crypto";

export function gen6(): string {
  // 100000..999999
  return String(crypto.randomInt(100000, 1000000));
}

export function hashCode(code: string): string {
  // можешь добавить SALT из env, но даже так уже норм для старта
  return crypto.createHash("sha256").update(code).digest("hex");
}
