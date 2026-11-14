"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  story: { id: string; title: string };
}

export default function CommentsManager() {
  const router = useRouter();
  const [items, setItems] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/comments?page=${p}&limit=10`);
        if (res.status === 401) { router.push("/admin"); return; }
        if (!res.ok) throw new Error("Tsy afaka naka ny hevitra.");
        const data = await res.json();
        setItems(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setPage(data.page);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Olana");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    void load(1);
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Hamafa ity hevitra ity?")) return;
    setDeleting(id);
    setError("");
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Tsy voafafa ny hevitra.");
      await load(items.length === 1 && page > 1 ? page - 1 : page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Olana");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900">Hevitra (Comments)</h2>
        <p className="mt-1 text-sm text-slate-500">{total} hevitra — fafao ireo tsy mety.</p>
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Ampidirina ny lisitra…</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">Mbola tsy misy hevitra.</div>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => (
            <li key={c.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:p-5">
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-bold text-slate-800">{c.author}</span>
                  <span className="mx-2 text-slate-300">•</span>
                  <span className="text-xs text-slate-400">{c.createdAt.slice(0, 10)}</span>
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{c.content}</p>
                <Link href={`/stories/${c.story.id}`} className="mt-2 inline-block text-xs font-semibold text-indigo-600 hover:underline">
                  ↳ {c.story.title}
                </Link>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                disabled={deleting === c.id}
                className="self-end rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50 sm:self-start"
              >
                Hamafa
              </button>
            </li>
          ))}
        </ul>
      )}
      {!loading && <Pagination page={page} totalPages={totalPages} onChange={(p) => void load(p)} />}
    </section>
  );
}
