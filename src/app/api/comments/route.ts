import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Admin ihany: lisitry ny hevitra rehetra (fanaraha-maso). */
export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Tsy azo atao" }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const limit = Math.min(50, Math.max(1, parseInt(params.get("limit") || "10", 10) || 10));

  try {
    const total = await prisma.comment.count();
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(totalPages, Math.max(1, parseInt(params.get("page") || "1", 10) || 1));

    const items = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { story: { select: { id: true, title: true } } },
    });
    return NextResponse.json({ items, total, page, totalPages, limit });
  } catch (err) {
    console.error("[api/comments]", err);
    return NextResponse.json({ error: "Tsy afaka mifandray amin'ny database." }, { status: 500 });
  }
}
