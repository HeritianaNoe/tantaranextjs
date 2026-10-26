import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  // Tsy avela upload raha tsy admin
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Tsy azo atao" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/avif",
          ],
          addRandomSuffix: true,
          // ~500 KB ampy tsara ho an'ny sary 500×400
          maximumSizeInBytes: 500 * 1024,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Azo atao fanampiny eto (log, update DB sns) raha ilaina
        console.log("[upload] Sary nampidirina:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("[api/upload]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nisy olana tamin'ny upload" },
      { status: 400 }
    );
  }
}
