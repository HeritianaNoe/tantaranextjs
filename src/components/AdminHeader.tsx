"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/admin/dashboard", label: "Fandraisana" },
  { href: "/admin/stories", label: "Tantara" },
  { href: "/admin/categories", label: "Sokajy" },
  { href: "/admin/comments", label: "Hevitra" },
  { href: "/admin/users", label: "Mpampiasa" },
];

export default function AdminHeader({
  title,
  subtitle,
  back,
}: {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } finally {
      router.push("/admin");
      router.refresh();
    }
  };

  const isActive = (href: string) =>
    href === "/admin/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="bg-gradient-to-r from-indigo-950 to-violet-800 text-white shadow-lg">
      <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href={back?.href ?? "/"} className="text-xs font-medium text-indigo-200 hover:text-white">
              {back?.label ?? "← Hijery ny tranonkala"}
            </Link>
            <h1 className="mt-1 text-2xl font-bold">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-indigo-100">{subtitle}</p>}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/20"
          >
            Hivoaka
          </button>
        </div>
        <nav aria-label="Fitantanana" className="-mx-1 mt-5 flex flex-wrap gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                isActive(item.href) ? "bg-white text-indigo-900" : "text-indigo-100 hover:bg-white/10"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
