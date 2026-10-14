"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Tsy afaka maka users");
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Olana");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tsy nahomby");
      setName("");
      setPassword("");
      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Olana");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    setError("");
    try {
      const body: { name?: string; password?: string } = {};
      if (editName) body.name = editName;
      if (editPassword) body.password = editPassword;
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tsy nahomby");
      setEditingId(null);
      setEditName("");
      setEditPassword("");
      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Olana");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hofafana ity user ity?")) return;
    setError("");
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Tsy nahomby");
      }
      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Olana");
    }
  };

  return (
    <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-7">
      <h2 className="mb-4 text-xl font-bold text-slate-900">Mpampiasa (Users) — CRUD</h2>
      <p className="mb-4 text-sm text-slate-500">
        id / name / password — mitahiry ao anaty base de données (password hashé)
      </p>

      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Create form */}
      <form onSubmit={handleCreate} className="mb-6 grid gap-3 sm:grid-cols-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Anarana (name)"
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          required
          minLength={4}
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "..." : "Hanampy user"}
        </button>
      </form>

      {/* List */}
      {loading ? (
        <p className="text-slate-500">Miandry...</p>
      ) : users.length === 0 ? (
        <p className="text-slate-500">
          Tsy mbola misy user. Ampiasao ny ADMIN_PASSWORD ao amin&apos;ny .env aloha, dia mamorona user eto.
        </p>
      ) : (
        <ul className="space-y-3">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              {editingId === u.id ? (
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={u.name}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                  />
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Password vaovao (tsy voatery)"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                    minLength={4}
                  />
                  <button
                    onClick={() => handleUpdate(u.id)}
                    disabled={saving}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    Tehirizo
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditName("");
                      setEditPassword("");
                    }}
                    className="rounded-lg bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700"
                  >
                    Ajanony
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <span className="font-semibold text-slate-800">{u.name}</span>
                    <span className="ml-2 text-xs text-slate-400">id: {u.id}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(u.id);
                        setEditName(u.name);
                        setEditPassword("");
                      }}
                      className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-200"
                    >
                      Hanova
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200"
                    >
                      Hamafa
                    </button>
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
