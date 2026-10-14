import { NextRequest, NextResponse } from "next/server";
import { createToken, authenticateUser, DatabaseError } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { name, password } = await req.json().catch(() => ({}));

  if (!password) {
    return NextResponse.json({ error: "Mot de passe ilaina" }, { status: 400 });
  }

  try {
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
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (err) {
    console.error("[api/auth]", err);
    const status = err instanceof DatabaseError ? 503 : 500;
    const message = err instanceof Error ? err.message : "Olana tao amin'ny serveur.";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_token", "", { path: "/", maxAge: 0 });
  return res;
}
