import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Mode client: antsoina rehefa misy tsindrio pejy. */
  onChange?: (page: number) => void;
  /** Mode server: ohatra "/search?q=abc" (ampiana &page=N / ?page=N ho azy). */
  hrefBase?: string;
}

function getPages(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

export default function Pagination({ page, totalPages, onChange, hrefBase }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const base = hrefBase ?? "";
    const sep = base.includes("?") ? "&" : "?";
    return p === 1 ? base || "?" : `${base}${sep}page=${p}`;
  };

  const base = "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition";
  const idle = "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700";
  const active = "border-indigo-600 bg-indigo-600 text-white";
  const disabled = "pointer-events-none opacity-40 border-slate-200 bg-white text-slate-400";

  const item = (p: number, label: React.ReactNode, cls: string, aria: string, current = false) =>
    onChange ? (
      <button key={aria} type="button" onClick={() => onChange(p)} aria-label={aria} aria-current={current ? "page" : undefined} className={`${base} ${cls}`}>
        {label}
      </button>
    ) : (
      <Link key={aria} href={hrefFor(p)} aria-label={aria} aria-current={current ? "page" : undefined} className={`${base} ${cls}`}>
        {label}
      </Link>
    );

  return (
    <nav aria-label="Pejy" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {item(Math.max(1, page - 1), "←", page === 1 ? disabled : idle, "Pejy teo aloha")}
      {getPages(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-slate-400">…</span>
        ) : (
          item(p, p, p === page ? active : idle, `Pejy ${p}`, p === page)
        )
      )}
      {item(Math.min(totalPages, page + 1), "→", page === totalPages ? disabled : idle, "Pejy manaraka")}
    </nav>
  );
}
