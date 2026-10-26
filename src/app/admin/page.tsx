"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Anarana na mot de passe diso");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-100 px-4">
      <h1 className="text-3xl font-extrabold tracking-tight text-indigo-900 sm:text-4xl">
        Tantara an-tsoratra
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Anarana (name)"
          className="w-full px-4 py-3 border rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          required
          autoComplete="username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="w-full px-4 py-3 border rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
          required
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Miandry..." : "Hiditra"}
        </button>
        <Link
          href="/"
          className="mt-3 block w-full py-3 text-center bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
        >
          ← Hiverina any amin&apos;ny home
        </Link>
      </form>
    </main>
  );
}
