import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

function dbError(err: unknown) {
  console.error("[api/stories]", err);
  return NextResponse.json(
    { error: "Tsy afaka mifandray amin'ny database. Jereo ny DATABASE_URL sy ny log ao Vercel." },
    { status: 500 }
  );
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";

  try {
    const stories = await prisma.story.findMany({
      where: q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(stories);
  } catch (err) {
    return dbError(err);
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Tsy azo atao" }, { status: 401 });
  }

  const { title, content, image } = await req.json().catch(() => ({}));

  if (!title || !content) {
    return NextResponse.json({ error: "Title sy content ilaina" }, { status: 400 });
  }

  try {
    const story = await prisma.story.create({
      data: { title, content, image: image || null },
    });
    return NextResponse.json(story, { status: 201 });
  } catch (err) {
    return dbError(err);
  }
}
