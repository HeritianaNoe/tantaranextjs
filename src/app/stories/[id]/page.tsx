import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function StoryPage({
  params,
}: {
  params: { id: string };
}) {
  const story = await prisma.story.findUnique({
    where: { id: params.id },
  });

  if (!story) notFound();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="text-indigo-600 hover:underline mb-6 inline-block"
        >
          ← Hiverina any amin&apos;ny lisitra
        </Link>

        <article className="bg-white rounded-xl shadow-md overflow-hidden">
          {story.image && (
            <img
              src={story.image}
              alt={story.title}
              className="w-full h-72 object-cover"
            />
          )}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {story.title}
            </h1>
            <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
              {story.content}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
