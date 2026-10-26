import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import StoryFormPage from "@/components/StoryFormPage";

export const dynamic = "force-dynamic";

export default async function NewStoryPage() {
  if (!(await isAuthenticated())) redirect("/admin");

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-indigo-950 to-violet-800 text-white shadow-lg">
        <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
          <Link href="/admin/dashboard" className="text-xs font-medium text-indigo-200 hover:text-white">
            ← Hiverina any amin&apos;ny fitantanana
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Tantara vaovao</h1>
          <p className="mt-1 text-sm text-indigo-100">Ampidiro ny lohateny, ny votoaty ary ny sary.</p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <StoryFormPage />
      </div>
    </main>
  );
}
