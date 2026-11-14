import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
import CategoriesManager from "@/components/CategoriesManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  if (!(await isAuthenticated())) redirect("/admin");

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminHeader title="Sokajy" subtitle="Tantano ny sokajin'ny tantara." />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <CategoriesManager />
      </div>
    </main>
  );
}
