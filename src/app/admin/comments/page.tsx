import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
import CommentsManager from "@/components/CommentsManager";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  if (!(await isAuthenticated())) redirect("/admin");

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminHeader title="Hevitra" subtitle="Fanaraha-maso ny hevitra navelan'ny mpamaky." />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <CommentsManager />
      </div>
    </main>
  );
}
