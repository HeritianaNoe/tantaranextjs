import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_AUTHOR = 40;
const MAX_CONTENT = 1000;

// Fanamarihana: voafetra amin'ny instance iray (serverless) — fiarovana fototra fotsiny, tsy solon'ny rate-limit amin'ny edge.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

/** Publika: lisitry ny hevitra (vaovao aloha). */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await prisma.comment.findMany({
      where: { storyId: params.id },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, author: true, content: true, createdAt: true },
    });
    return NextResponse.json(comments);
  } catch (err) {
    console.error("[api/stories/:id/comments]", err);
    return NextResponse.json({ error: "Tsy afaka naka ny hevitra." }, { status: 500 });
  }
}

/** Publika: ny mpamaky rehetra afaka mamela hevitra. */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => ({}));

  // Honeypot: ny robot ihany no mameno ny saha miafina "website".
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ success: true }, { status: 201 });
  }

  const author = typeof body.author === "string" ? body.author.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (author.length < 2 || author.length > MAX_AUTHOR) {
    return NextResponse.json({ error: `Anarana: 2 hatramin'ny ${MAX_AUTHOR} tarehintsoratra` }, { status: 400 });
  }
  if (content.length < 2 || content.length > MAX_CONTENT) {
    return NextResponse.json({ error: `Hevitra: 2 hatramin'ny ${MAX_CONTENT} tarehintsoratra` }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(ip)) {
    return NextResponse.json({ error: "Be loatra ny hevitra nalefa. Andraso kely dia andramo indray." }, { status: 429 });
  }

  try {
    const story = await prisma.story.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!story) return NextResponse.json({ error: "Tsy hita ny tantara" }, { status: 404 });

    const comment = await prisma.comment.create({
      data: { storyId: params.id, author, content },
      select: { id: true, author: true, content: true, createdAt: true },
    });
    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error("[api/stories/:id/comments]", err);
    return NextResponse.json({ error: "Tsy voatahiry ny hevitra." }, { status: 500 });
  }
}
