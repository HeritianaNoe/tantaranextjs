import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { isForeignKeyViolation } from "@/lib/slug";

export const dynamic = "force-dynamic";

function dbError(err: unknown) {
  console.error("[api/stories/:id]", err);
  return NextResponse.json(
    { error: "Tsy afaka mifandray amin'ny database. Jereo ny log ao Vercel." },
    { status: 500 }
  );
}

const storyInclude = {
  category: { select: { id: true, name: true, slug: true } },
  _count: { select: { comments: true } },
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const story = await prisma.story.findUnique({
      where: { id: params.id },
      include: storyInclude,
    });
    if (!story) return NextResponse.json({ error: "Tsy hita" }, { status: 404 });
    return NextResponse.json(story);
  } catch (err) {
    return dbError(err);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Tsy azo atao" }, { status: 401 });
  }

  const { title, content, image, categoryId } = await req.json().catch(() => ({}));

  // `categoryId` tsy nalefa => tsy ovaina; "" na null => esorina ny sokajy.
  const data: { title?: string; content?: string; image?: string | null; categoryId?: string | null } = {
    title,
    content,
    image,
  };
  if (categoryId !== undefined) data.categoryId = categoryId || null;

  try {
    const story = await prisma.story.update({
      where: { id: params.id },
      data,
      include: storyInclude,
    });
    return NextResponse.json(story);
  } catch (err) {
    if (isForeignKeyViolation(err)) {
      return NextResponse.json({ error: "Tsy hita ny sokajy nofidina" }, { status: 400 });
    }
    return dbError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Tsy azo atao" }, { status: 401 });
  }

  try {
    await prisma.story.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return dbError(err);
  }
}
