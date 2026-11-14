import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StoryCard from "@/components/StoryCard";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 9;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string | string[] };
}) {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!category) notFound();

  const rawPage = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const requested = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);

  const total = await prisma.story.count({ where: { categoryId: category.id } });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requested, totalPages);

  const [stories, categories] = await Promise.all([
    prisma.story.findMany({
      where: { categoryId: category.id },
      include: {
        category: { select: { name: true, slug: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { stories: true } } },
    }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-indigo-950 to-violet-800 text-white shadow-lg">
        <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
          <Link href="/" className="text-xs font-medium text-indigo-200 hover:text-white">
            ← Hiverina any amin&apos;ny tranonkala
          </Link>
          <p className="mt-2 text-xs font-bold uppercase tracking-[.18em] text-indigo-200">Sokajy</p>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          {category.description && <p className="mt-1 text-sm text-indigo-100">{category.description}</p>}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <nav aria-label="Sokajy" className="mb-6 flex flex-wrap gap-2">
          <Link href="/" className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-700">Rehetra</Link>
          {categories.map((c) =>
            c.id === category.id ? (
              <span key={c.id} aria-current="page" className="rounded-full bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white">
                {c.name} <span className="text-xs text-indigo-200">{c._count.stories}</span>
              </span>
            ) : (
              <Link key={c.id} href={`/categories/${c.slug}`} className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-700">
                {c.name} <span className="text-xs text-slate-400">{c._count.stories}</span>
              </Link>
            )
          )}
        </nav>

        <p className="mb-5 text-sm text-slate-500">{total} tantara</p>

        {stories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <h2 className="font-bold text-slate-800">Mbola tsy misy tantara amin&apos;ity sokajy ity</h2>
            <p className="mt-1 text-sm text-slate-500">Jereo indray rehefa misy tantara vaovao.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} hrefBase={`/categories/${category.slug}`} />
      </div>
    </main>
  );
}
