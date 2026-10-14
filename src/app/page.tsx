"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import StoryCard from "@/components/StoryCard";

interface Story { id: string; title: string; content: string; image: string | null; createdAt: string; }

export default function HomePage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const fetchStories = async () => {
      setLoading(true); setError("");
      try {
        const res = await fetch(`/api/stories?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!res.ok) throw new Error("Tsy afaka naka ny lisitry ny tantara.");
        const data: unknown = await res.json();
        if (!Array.isArray(data)) throw new Error("Valiny tsy araka ny tokony ho izy avy amin'ny serveur.");
        setStories(data as Story[]);
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") setError(e.message || "Nisy olana tamin'ny fifandraisana.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    };
    fetchStories();
    return () => controller.abort();
  }, [query]);

  return (
    <main className="min-h-screen">
      <header className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-700 text-white">
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Pejy fandraisana">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20"><svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z"/><path d="M4 6v15M8 7h8M8 11h8M8 15h5"/></svg></span>
            <span><span className="block text-lg font-bold tracking-tight sm:text-xl">Tantara An-tsoratra</span><span className="hidden text-xs text-indigo-100 sm:block">Tantara hovakiana sy hizarana</span></span>
          </Link>
          <Link href="/admin" className="rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/20">Admin <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.22em] text-indigo-200">Tongasoa eto amin'ny tranomboky</p>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">Tantara tsara, <span className="text-violet-200">famakiana mahafinaritra.</span></h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">Mitadiava tantara mahaliana, vakio moramora, ary ankafizo ny tontolon'ny soratra.</p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">Ny fanangonana</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Lisitry ny tantara</h2></div><span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-500 shadow-sm ring-1 ring-slate-200">{stories.length} tantara</span></div>
        <SearchBar onSearch={setQuery} />
        {loading ? <div className="grid gap-6 pt-8 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((n) => <div key={n} className="h-72 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"><div className="h-40 rounded-t-2xl bg-slate-200"/><div className="space-y-3 p-5"><div className="h-4 w-3/4 rounded bg-slate-200"/><div className="h-3 rounded bg-slate-100"/><div className="h-3 w-2/3 rounded bg-slate-100"/></div></div>)}</div>
        : error ? <div role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error} <button onClick={() => window.location.reload()} className="ml-2 font-bold underline">Andramo indray</button></div>
        : stories.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">⌕</div><h3 className="font-bold text-slate-800">Tsy nahitana tantara</h3><p className="mt-1 text-sm text-slate-500">Andramo teny hafa, na jereo indray rehefa misy tantara vaovao.</p></div>
        : <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{stories.map((story) => <StoryCard key={story.id} story={story} />)}</div>}
      </section>
      <footer className="border-t border-slate-200 bg-white/70 py-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} Tantara An-tsoratra · Famakiana mahafinaritra</footer>
    </main>
  );
}
