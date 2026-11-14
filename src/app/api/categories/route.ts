import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { makeSlug, isUniqueViolation } from "@/lib/slug";

export const dynamic = "force-dynamic";

function dbError(err: unknown) {
  console.error("[api/categories]", err);
  return NextResponse.json(
    { error: "Tsy afaka mifandray amin'ny database. Alefaso `prisma db push` raha mbola tsy vita." },
    { status: 500 }
  );
}

/** Publika: ilaina amin'ny pejy fandraisana sy ny formulaire admin. */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { stories: true } } },
    });
    return NextResponse.json(categories);
  } catch (err) {
    return dbError(err);
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Tsy azo atao" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";

  if (name.length < 2 || name.length > 40) {
    return NextResponse.json({ error: "Anarana: 2 hatramin'ny 40 tarehintsoratra" }, { status: 400 });
  }
  if (description.length > 200) {
    return NextResponse.json({ error: "Famaritana: 200 tarehintsoratra no ambony indrindra" }, { status: 400 });
  }

  try {
    const slug = makeSlug(name);
    const existing = await prisma.category.findFirst({
      where: { OR: [{ name: { equals: name, mode: "insensitive" } }, { slug }] },
    });
    if (existing) {
      return NextResponse.json({ error: "Ity sokajy ity efa misy" }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: { name, slug, description: description || null },
      include: { _count: { select: { stories: true } } },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: "Ity sokajy ity efa misy" }, { status: 409 });
    }
    return dbError(err);
  }
}
