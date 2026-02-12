import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: [{ navOrder: "asc" }, { homeOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const body = await req.json();

  const title = String(body.title ?? "").trim();
  const slug = String(body.slug ?? "").trim() || slugify(title);

  const navOrder = Number(body.navOrder ?? 0);
  const homeOrder = Number(body.homeOrder ?? 0);

  const showInNav = typeof body.showInNav === "boolean" ? body.showInNav : true;
  const showOnHome = typeof body.showOnHome === "boolean" ? body.showOnHome : true;

  if (!title) return NextResponse.json({ error: "Название обязательно" }, { status: 400 });

  const created = await prisma.category.create({
    data: { title, slug, navOrder, homeOrder, showInNav, showOnHome },
  });

  return NextResponse.json(created);
}
