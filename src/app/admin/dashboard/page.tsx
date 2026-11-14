import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminHeader from "@/components/AdminHeader";

export const dynamic = "force-dynamic";

async function getCounts() {
  try {
    const [stories, categories, comments, users] = await Promise.all([
      prisma.story.count(),
      prisma.category.count(),
      prisma.comment.count(),
      prisma.user.count(),
    ]);
    return { stories, categories, comments, users };
  } catch (err) {
    console.error("[dashboard]", err);
    return null;
  }
}

export default async function AdminDashboard() {
  if (!(await isAuthenticated())) redirect("/admin");
  const counts = await getCounts();
  const n = (v: number | undefined) => (v === undefined ? "—" : String(v));

  const cards = [
    { href: "/admin/stories", title: "Tantara voatahiry", desc: "Ampio, ovao na fafao ny tantara.", count: n(counts?.stories), unit: "tantara" },
    { href: "/admin/categories", title: "Sokajy", desc: "Fitantanana ny sokajin'ny tantara.", count: n(counts?.categories), unit: "sokajy" },
    { href: "/admin/comments", title: "Hevitra", desc: "Fanaraha-maso ny hevitry ny mpamaky.", count: n(counts?.comments), unit: "hevitra" },
    { href: "/admin/users", title: "Mpampiasa (Users) — CRUD", desc: "Ireo afaka miditra amin'ny admin.", count: n(counts?.users), unit: "user" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminHeader title="Fitantanana" subtitle="Misafidiara ny ampahany tianao tantanana." />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {!counts && (
          <p role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Tsy azo ny isa avy amin&apos;ny database. Jereo raha vita ny <code>prisma db push</code>.
          </p>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700">{c.title}</h2>
                <span aria-hidden="true" className="text-indigo-600 transition-transform group-hover:translate-x-1">→</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{c.desc}</p>
              <p className="mt-4 text-3xl font-extrabold text-indigo-900">
                {c.count} <span className="text-sm font-medium text-slate-400">{c.unit}</span>
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
