"use client";

import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { stories: number };
}

const input = "rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

export default function CategoriesManager() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Tsy afaka naka ny sokajy.");
      setItems(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Olana");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const call = async (url: string, method: string, body?: unknown) => {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Tsy nahomby");
    return data;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await call("/api/categories", "POST", { name, description });
      setName("");
      setDescription("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Olana");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    setError("");
    try {
      await call(`/api/categories/${id}`, "PUT", { name: editName, description: editDescription });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Olana");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Category) => {
    const warn = c._count.stories > 0
      ? `Hofafana ny sokajy “${c.name}”. Ny tantara ${c._count.stories} ao anatiny dia tsy ho voafafa fa ho “tsy misy sokajy”. Hanohy?`
      : `Hofafana ny sokajy “${c.name}”?`;
    if (!confirm(warn)) return;
    setError("");
    try {
      await call(`/api/categories/${c.id}`, "DELETE");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Olana");
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-7">
      <h2 className="mb-1 text-xl font-bold text-slate-900">Sokajy (Categories) — CRUD</h2>
      <p className="mb-4 text-sm text-slate-500">Ampifandraisina amin&apos;ny tantara ny sokajy; ampiasaina amin&apos;ny sivana eo amin&apos;ny tranonkala.</p>

      {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleCreate} className="mb-6 grid gap-3 sm:grid-cols-[1fr_1.5fr_auto]">
        <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Anaran'ny sokajy" required minLength={2} maxLength={40} />
        <input className={input} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Famaritana (tsy voatery)" maxLength={200} />
        <button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
          {saving ? "..." : "Hanampy sokajy"}
        </button>
      </form>

      {loading ? (
        <p className="text-slate-500">Miandry...</p>
      ) : items.length === 0 ? (
        <p className="text-slate-500">Mbola tsy misy sokajy.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => (
            <li key={c.id} className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              {editingId === c.id ? (
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                  <input className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm" value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={40} />
                  <input className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Famaritana" maxLength={200} />
                  <button onClick={() => handleUpdate(c.id)} disabled={saving} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">Tehirizo</button>
                  <button onClick={() => setEditingId(null)} className="rounded-lg bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700">Ajanony</button>
                </div>
              ) : (
                <>
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800">{c.name}</span>
                    <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 ring-1 ring-slate-200">{c._count.stories} tantara</span>
                    <span className="ml-2 text-xs text-slate-400">/categories/{c.slug}</span>
                    {c.description && <p className="mt-1 text-sm text-slate-500">{c.description}</p>}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => { setEditingId(c.id); setEditName(c.name); setEditDescription(c.description ?? ""); }}
                      className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-200"
                    >Hanova</button>
                    <button onClick={() => handleDelete(c)} className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200">Hamafa</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
