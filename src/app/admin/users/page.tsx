import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
import UsersManager from "@/components/UsersManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  if (!(await isAuthenticated())) redirect("/admin");

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminHeader
        title="Mpampiasa (Users)"
        subtitle="Ampio, ovao na fafao ny mpampiasa afaka miditra amin'ny admin."
      />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <UsersManager />
      </div>
    </main>
  );
}
