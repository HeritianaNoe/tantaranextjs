import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
import StoriesManager from "@/components/StoriesManager";

export const dynamic = "force-dynamic";

export default async function AdminStoriesPage() {
  if (!(await isAuthenticated())) redirect("/admin");

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminHeader title="Tantara voatahiry" subtitle="Ampio, ovao na fafao ny tantara; sivano araka ny sokajy." />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <StoriesManager />
      </div>
    </main>
  );
}
