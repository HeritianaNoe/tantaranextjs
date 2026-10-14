"use client";

import { useState } from "react";

interface Story {
  id: string;
  title: string;
  content: string;
  image: string | null;
}

export default function AdminForm({
  story,
  onSuccess,
  onCancel,
}: {
  story: Story | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(story?.title || "");
  const [content, setContent] = useState(story?.content || "");
  const [image, setImage] = useState(story?.image || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = { title: title.trim(), content: content.trim(), image: image.trim() || null };
      const url = story ? `/api/stories/${story.id}` : "/api/stories";
      const method = story ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) {
        const result = await res.json().catch(() => null);
        throw new Error(result?.error || "Tsy voatahiry ny tantara. Jereo raha mbola tafiditra admin ianao.");
      }
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nisy olana tamin'ny fitahirizana.");
    } finally { setLoading(false); }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-7"
    >
      <h2 className="text-xl font-bold text-slate-900">
        {story ? "Hanova tantara" : "Tantara vaovao"}
      </h2>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <label className="block space-y-2 text-sm font-semibold text-slate-700">Lohateny
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
        required
      />
      </label>

      <label className="block space-y-2 text-sm font-semibold text-slate-700">Votoatin'ny tantara
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Votoatin'ny tantara..."
        rows={8}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal leading-6 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
        required
      />
      </label>

      <label className="block space-y-2 text-sm font-semibold text-slate-700">Rohy sary (tsy voatery)
      <input
        type="url"
        value={image}
        onChange={(e) => setImage(e.target.value)}
        placeholder="URL sary (optional)"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
      />
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Mitahiry..." : "Tehirizo"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl bg-slate-100 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-200"
        >
          Ajanony
        </button>
      </div>
    </form>
  );
}
