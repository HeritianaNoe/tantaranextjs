"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

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

  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Upload sary mivantana any amin'ny Vercel Blob (client → Blob)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError("");

      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      setImage(blob.url);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Nisy olana tamin'ny fanaovana upload ny sary."
      );
    } finally {
      setUploadingImage(false);
      // Averina foana ny input mba ahafahana mifidy sary mitovy indray
      e.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setImage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = {
        title: title.trim(),
        content: content.trim(),
        image: image.trim() || null,
      };
      const url = story ? `/api/stories/${story.id}` : "/api/stories";
      const method = story ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => null);
        throw new Error(
          result?.error ||
            "Tsy voatahiry ny tantara. Jereo raha mbola tafiditra admin ianao."
        );
      }
      onSuccess();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Nisy olana tamin'ny fitahirizana."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-7"
    >
      <h2 className="text-xl font-bold text-slate-900">
        {story ? "Hanova tantara" : "Tantara vaovao"}
      </h2>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <label className="block space-y-2 text-sm font-semibold text-slate-700">
        Lohateny
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          required
        />
      </label>

      <label className="block space-y-2 text-sm font-semibold text-slate-700">
        Votoatin&apos;ny tantara
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Votoatin'ny tantara..."
          rows={8}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal leading-6 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          required
        />
      </label>

      {/* Upload Sary */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Sarin&apos;ny tantara (tsy voatery)
        </label>

        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImage}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
          />
        </div>

        {uploadingImage && (
          <p className="text-xs text-indigo-600">
            Alefa any amin&apos;ny Vercel Blob ny sary...
          </p>
        )}

        {image && (
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="Preview"
              className="h-20 w-20 shrink-0 rounded-lg object-cover border border-slate-200"
            />
            <div className="min-w-0 flex-1 space-y-2">
              <input
                type="text"
                value={image}
                readOnly
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-xs font-medium text-red-600 hover:text-red-700"
              >
                Esory ny sary
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || uploadingImage}
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
