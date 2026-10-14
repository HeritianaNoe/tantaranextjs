import { NextRequest, NextResponse } from "next/server";
import { createToken, authenticateUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { name, password } = await req.json();

  if (!password) {
    return NextResponse.json({ error: "Mot de passe ilaina" }, { status: 400 });
  }

  const user = await authenticateUser(password, name);
  if (!user) {
    return NextResponse.json({ error: "Anarana na mot de passe diso" }, { status: 401 });
  }

  const token = await createToken(user.id, user.name);
  const res = NextResponse.json({ success: true, name: user.name });
  res.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("admin_token");
  return res;
}
