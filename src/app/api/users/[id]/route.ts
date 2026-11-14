import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Tsy azo atao" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });
  if (!user) return NextResponse.json({ error: "Tsy hita" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Tsy azo atao" }, { status: 401 });
  }

  const body = await req.json();
  const { name, password } = body;

  const data: { name?: string; password?: string } = {};
  if (name) data.name = name;
  if (password) {
    if (password.length < 4) {
      return NextResponse.json({ error: "Password tsy maintsy 4+ caractères" }, { status: 400 });
    }
    data.password = await hashPassword(password);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Tsy misy ovaina" }, { status: 400 });
  }

  try {
    if (data.name) {
      const clash = await prisma.user.findFirst({
        where: { id: { not: params.id }, name: { equals: data.name, mode: "insensitive" } },
        select: { id: true },
      });
      if (clash) {
        return NextResponse.json({ error: "Ity anarana ity efa misy" }, { status: 409 });
      }
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Tsy hita ny user" }, { status: 404 });
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
    // Tsy afaka mamafa ny user farany: raha foana ny table dia noforonina indray ny admin/zakaranda (lalana fidirana fantatry ny rehetra).
    const count = await prisma.user.count();
    if (count <= 1) {
      return NextResponse.json(
        { error: "Tsy azo fafana ny user farany. Mamorona user hafa aloha." },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Tsy hita" }, { status: 404 });
  }
}
