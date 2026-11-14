import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { isForeignKeyViolation } from "@/lib/slug";

export const dynamic = "force-dynamic";

function dbError(err: unknown) {
  console.error("[api/stories]", err);
  return NextResponse.json(
    { error: "Tsy afaka mifandray amin'ny database. Jereo ny DATABASE_URL sy ny log ao Vercel." },
    { status: 500 }
  );
}

const storyInclude = {
  category: { select: { id: true, name: true, slug: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.StoryInclude;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const q = params.get("q") || "";
  const category = params.get("category") || ""; // slug
  const paginated = params.has("page") || params.has("limit");

  const and: Prisma.StoryWhereInput[] = [];
  if (q) {
    and.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (category === "none") and.push({ categoryId: null });
  else if (category) and.push({ category: { slug: category } });
  const where: Prisma.StoryWhereInput | undefined = and.length ? { AND: and } : undefined;

  try {
    if (!paginated) {
      const stories = await prisma.story.findMany({
        where,
        include: storyInclude,
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(stories);
    }

    const limit = Math.min(50, Math.max(1, parseInt(params.get("limit") || "10", 10) || 10));
    const total = await prisma.story.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(totalPages, Math.max(1, parseInt(params.get("page") || "1", 10) || 1));

    const items = await prisma.story.findMany({
      where,
      include: storyInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return NextResponse.json({ items, total, page, totalPages, limit });
  } catch (err) {
    return dbError(err);
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Tsy azo atao" }, { status: 401 });
  }

  const { title, content, image, categoryId } = await req.json().catch(() => ({}));

  if (!title || !content) {
    return NextResponse.json({ error: "Title sy content ilaina" }, { status: 400 });
  }

  try {
    const story = await prisma.story.create({
      data: {
        title,
        content,
        image: image || null,
        categoryId: categoryId || null,
      },
      include: storyInclude,
    });
    return NextResponse.json(story, { status: 201 });
  } catch (err) {
    if (isForeignKeyViolation(err)) {
      return NextResponse.json({ error: "Tsy hita ny sokajy nofidina" }, { status: 400 });
    }
    return dbError(err);
  }
}
