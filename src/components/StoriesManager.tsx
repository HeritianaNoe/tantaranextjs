"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 10;

interface Category { id: string; name: string; slug: string; _count?: { stories: number }; }
interface Story {
  id: string;
  title: string;
  content: string;
  image: string | null;
  category: { id: string; name: string; slug: string } | null;
  _count: { comments: number };
}

function ActionIcon({ type }: { type: "edit" | "delete" }) {
  return type === "edit" ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></svg>
  );
}

export default function StoriesManager() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState(""); // "" = rehetra, "none" = tsy misy sokajy, na slug
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadStories = useCallback(
    async (p: number, f: string) => {
      setLoading(true);
      setError("");
      try {
        const qs = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) });
        if (f) qs.set("category", f);
        const res = await fetch(`/api/stories?${qs.toString()}`);
        if (res.status === 401) { router.push("/admin"); return; }
        if (!res.ok) throw new Error("Tsy afaka naka ny lisitry ny tantara.");
        const data = await res.json();
        if (!data || !Array.isArray(data.items)) throw new Error("Valiny tsy mety avy amin'ny serveur.");
        setStories(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setPage(data.page);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Nisy olana.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    void loadStories(1, filter);
  }, [filter, loadStories]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => Array.isArray(d) && setCategories(d))
      .catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hamafa tanteraka ity tantara ity ve ianao? Hofafana koa ny hevitra rehetra mifandray aminy.")) return;
    setDeleting(id);
    setError("");
    try {
      const res = await fetch(`/api/stories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Tsy voafafa ilay tantara. Jereo ny fidirana admin.");
      // Raha foana ny pejy farany taorian'ny famafana dia miverina any aloha
      await loadStories(stories.length === 1 && page > 1 ? page - 1 : page, filter);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nisy olana tamin'ny famafana.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tantara voatahiry</h2>
          <p className="mt-1 text-sm text-slate-500">{total} tantara</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="category-filter">Sivana araka ny sokajy</label>
          <select
            id="category-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">Sokajy rehetra</option>
            <option value="none">Tsy misy sokajy</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <Link href="/admin/stories/new" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700">
            <span className="text-lg leading-none">+</span> Tantara vaovao
          </Link>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}{" "}
          <button onClick={() => void loadStories(page, filter)} className="font-bold underline">Andramo indray</button>
        </p>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Ampidirina ny lisitra…</div>
      ) : stories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="font-semibold text-slate-700">Mbola tsy misy tantara{filter ? " amin'ity sokajy ity" : ""}.</p>
          <p className="mt-1 text-sm text-slate-500">Tsindrio “Tantara vaovao” hanampiana iray.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => (
            <article key={story.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  {story.category ? (
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">{story.category.name}</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">Tsy misy sokajy</span>
                  )}
                  <span className="text-xs text-slate-400">{story._count.comments} hevitra</span>
                </div>
                <h3 className="break-words text-base font-bold text-slate-800">{story.title}</h3>
                <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-slate-500">{story.content}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                <Link href={`/admin/stories/${story.id}/edit`} title="Hanova tantara" aria-label={`Hanova: ${story.title}`} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100"><ActionIcon type="edit" /></Link>
                <button type="button" onClick={() => void handleDelete(story.id)} disabled={deleting === story.id} title="Hamafa tantara" aria-label={`Hamafa: ${story.title}`} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 hover:border-rose-300 hover:bg-rose-100 disabled:cursor-wait disabled:opacity-50"><ActionIcon type="delete" /></button>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && <Pagination page={page} totalPages={totalPages} onChange={(p) => void loadStories(p, filter)} />}
    </section>
  );
}
