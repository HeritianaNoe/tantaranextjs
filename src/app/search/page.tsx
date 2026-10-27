import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 10;

export const dynamic = "force-dynamic";

interface StoryRow { id: string; title: string; content: string; }

async function findStories(q: string, page: number) {
  const where = {
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { content: { contains: q, mode: "insensitive" as const } },
    ],
  };
  const total = await prisma.story.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const stories: StoryRow[] = await prisma.story.findMany({
    where,
    select: { id: true, title: true, content: true },
    orderBy: { createdAt: "desc" },
    skip: (current - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  return { stories, total, totalPages, page: current };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string | string[]; page?: string | string[] };
}) {
  const raw = searchParams.q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";

  const rawPage = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const requestedPage = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);

  let stories: StoryRow[] = [];
  let total = 0;
  let totalPages = 1;
  let page = 1;
  let failed = false;
  if (q) {
    try {
      ({ stories, total, totalPages, page } = await findStories(q, requestedPage));
    } catch (err) {
      console.error("[search]", err);
      failed = true;
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-indigo-950 to-violet-800 text-white shadow-lg">
        <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
          <Link href="/" className="text-xs font-medium text-indigo-200 hover:text-white">
            ← Hiverina any amin&apos;ny tranonkala
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Fikarohana tantara</h1>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <SearchBar key={q} defaultValue={q} />

        <div className="mb-4 mt-8">
          <h2 className="text-xl font-bold text-slate-900">
            {q ? `Valiny ho an'ny “${q}”` : "Valin'ny fikarohana"}
          </h2>
          {q && !failed && <p className="mt-1 text-sm text-slate-500">{total} tantara</p>}
        </div>

        {failed ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Tsy afaka nitady tantara ankehitriny. Andramo indray afaka kelikely.
          </div>
        ) : !q ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="font-semibold text-slate-700">Soraty ny teny hitadiavana.</p>
            <p className="mt-1 text-sm text-slate-500">Mitady amin&apos;ny lohateny sy ny votoatin&apos;ny tantara.</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="font-semibold text-slate-700">Tsy nahitana tantara.</p>
            <p className="mt-1 text-sm text-slate-500">Andramo teny hafa.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                aria-label={`Vakio: ${story.title}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md sm:p-5"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-base font-bold text-slate-800 group-hover:text-indigo-700">{story.title}</h3>
                  <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-slate-500">{story.content}</p>
                </div>
                <span aria-hidden="true" className="shrink-0 text-lg text-indigo-600 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
        )}
        {q && !failed && <Pagination page={page} totalPages={totalPages} hrefBase={`/search?q=${encodeURIComponent(q)}`} />}
      </div>
    </main>
  );
}
