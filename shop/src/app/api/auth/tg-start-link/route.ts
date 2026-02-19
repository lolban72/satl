import { auth } from "@/auth";
import { signStartToken, makeBotStartLink } from "@/lib/tg";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const token = signStartToken({ userId, iat: Math.floor(Date.now() / 1000) });
  const url = makeBotStartLink(token);

  return Response.json({ url });
}
