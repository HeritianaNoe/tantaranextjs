import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { makeSlug, isUniqueViolation } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const clash = await prisma.category.findFirst({
      where: {
        id: { not: params.id },
        OR: [{ name: { equals: name, mode: "insensitive" } }, { slug }],
      },
    });
    if (clash) {
      return NextResponse.json({ error: "Ity anarana ity efa ampiasain'ny sokajy hafa" }, { status: 409 });
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: { name, slug, description: description || null },
      include: { _count: { select: { stories: true } } },
    });
    return NextResponse.json(category);
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: "Ity anarana ity efa misy" }, { status: 409 });
    }
    return NextResponse.json({ error: "Tsy hita ny sokajy" }, { status: 404 });
  }
}

/** Ny tantara ao anatiny dia tsy voafafa: mijanona ho "tsy misy sokajy" (onDelete: SetNull). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Tsy azo atao" }, { status: 401 });
  }

  try {
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Tsy hita ny sokajy" }, { status: 404 });
  }
}
