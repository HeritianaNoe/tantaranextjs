"use client";

import { useState } from "react";

export interface PublicComment {
  id: string;
  author: string;
  content: string;
  createdAt: string; // ISO
}

const field = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

export default function CommentSection({
  storyId,
  initialComments,
}: {
  storyId: string;
  initialComments: PublicComment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/stories/${storyId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, content, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Tsy voatahiry ny hevitra.");
      if (data.id) setComments((prev) => [data as PublicComment, ...prev]);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nisy olana.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section aria-labelledby="comments-title" className="mt-8 rounded-xl bg-white p-6 shadow-md sm:p-8">
      <h2 id="comments-title" className="text-xl font-bold text-gray-900">
        Hevitra <span className="text-base font-medium text-gray-400">({comments.length})</span>
      </h2>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <input className={field} value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Anaranao" required minLength={2} maxLength={40} aria-label="Anaranao" />
        <textarea className={field} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Soraty ny hevitrao..." rows={4} required minLength={2} maxLength={1000} aria-label="Hevitrao" />
        {/* Honeypot: miafina amin'ny olombelona */}
        <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden="true" name="website" />
        <button type="submit" disabled={sending} className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50">
          {sending ? "Mandefa..." : "Alefa ny hevitra"}
        </button>
      </form>

      {comments.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">Mbola tsy misy hevitra. Ho voalohany ve ianao?</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm">
                <span className="font-bold text-slate-800">{c.author}</span>
                <span className="mx-2 text-slate-300">•</span>
                <time dateTime={c.createdAt} className="text-xs text-slate-400">{c.createdAt.slice(0, 10)}</time>
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
