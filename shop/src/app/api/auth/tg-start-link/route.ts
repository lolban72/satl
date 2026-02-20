import { auth } from "@/auth";
import { signStartToken, makeBotStartLink } from "@/lib/tg";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    console.log("[tg-start-link] Unauthorized request");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = signStartToken({ userId, iat: Math.floor(Date.now() / 1000) });
  const url = makeBotStartLink(token);

  console.log("[tg-start-link] Generated start link:", url);

  return Response.json({ url });
}