import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated, hashPassword } from "@/lib/auth";

function noUserModel() {
  return NextResponse.json(
    {
      error:
        "Model User tsy hita. Alefaso: npx prisma generate && npx prisma db push ary restart npm run dev",
    },
    { status: 503 }
  );
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Tsy azo atao" }, { status: 401 });
  }

  if (!prisma.user) return noUserModel();

  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (err) {
    console.error(err);
    return noUserModel();
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Tsy azo atao" }, { status: 401 });
  }

  if (!prisma.user) return noUserModel();

  const body = await req.json();
  const { name, password } = body;

  if (!name || !password) {
    return NextResponse.json({ error: "Name sy password ilaina" }, { status: 400 });
  }

  if (password.length < 4) {
    return NextResponse.json({ error: "Password tsy maintsy 4+ caractères" }, { status: 400 });
  }

  try {
    const existing = await prisma.user.findFirst({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Ity anarana ity efa misy" }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, password: hashed },
      select: { id: true, name: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error(err);
    return noUserModel();
  }
}
