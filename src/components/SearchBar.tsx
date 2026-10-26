"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();
  return <form onSubmit={(e) => { e.preventDefault(); const q = value.trim(); router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search"); }} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row">
    <label className="flex min-w-0 flex-1 items-center gap-3 px-3"><svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><input type="search" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Mitady tantara amin'ny lohateny na votoaty..." className="w-full border-0 bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0" /></label>
    <button type="submit" className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">Mitady</button>
  </form>;
}
