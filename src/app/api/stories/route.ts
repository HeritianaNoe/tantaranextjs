import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

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
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Tsy azo atao" }, { status: 401 });
  }

  const body = await req.json();
  const { title, content, image } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "Title sy content ilaina" }, { status: 400 });
  }

  const story = await prisma.story.create({
    data: { title, content, image: image || null },
  });

  return NextResponse.json(story, { status: 201 });
}
