import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StoryFormPage from "@/components/StoryFormPage";

export const dynamic = "force-dynamic";

export default async function EditStoryPage({ params }: { params: { id: string } }) {
  if (!(await isAuthenticated())) redirect("/admin");

  const story = await prisma.story.findUnique({
    where: { id: params.id },
    select: { id: true, title: true, content: true, image: true },
  });
  if (!story) notFound();

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-indigo-950 to-violet-800 text-white shadow-lg">
        <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
          <Link href="/admin/dashboard" className="text-xs font-medium text-indigo-200 hover:text-white">
            ← Hiverina any amin&apos;ny fitantanana
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Hanova tantara</h1>
          <p className="mt-1 text-sm text-indigo-100">Ovao ny lohateny, ny votoaty na ny sary.</p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <StoryFormPage story={story} />
      </div>
    </main>
  );
}
