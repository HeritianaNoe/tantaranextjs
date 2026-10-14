import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated, hashPassword } from "@/lib/auth";

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
    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Tsy hita na anarana efa misy" }, { status: 404 });
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
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Tsy hita" }, { status: 404 });
  }
}
