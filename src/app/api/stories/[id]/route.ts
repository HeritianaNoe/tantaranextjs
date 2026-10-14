import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const story = await prisma.story.findUnique({ where: { id: params.id } });
  if (!story) return NextResponse.json({ error: "Tsy hita" }, { status: 404 });
  return NextResponse.json(story);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Tsy azo atao" }, { status: 401 });
  }

  const body = await req.json();
  const { title, content, image } = body;

  const story = await prisma.story.update({
    where: { id: params.id },
    data: { title, content, image },
  });

  return NextResponse.json(story);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Tsy azo atao" }, { status: 401 });
  }

  await prisma.story.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
