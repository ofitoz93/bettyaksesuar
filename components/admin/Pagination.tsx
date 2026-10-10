import Link from "next/link";

export default function Pagination({
  basePath,
  searchParams,
  page,
  pageSize,
  total,
}: {
  basePath: string;
  searchParams: Record<string, string | undefined>;
  page: number;
  pageSize: number;
  total: number;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const hrefFor = (target: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "sayfa") params.set(key, value);
    }
    if (target > 1) params.set("sayfa", String(target));
    return `${basePath}${params.size ? `?${params}` : ""}`;
  };

  return (
    <div className="flex items-center justify-between gap-3 px-1 py-3 text-xs text-ink-soft">
      <span>
        {from}–{to} / {total} kayıt
      </span>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className="border border-line bg-white px-3 py-1.5 hover:border-ink">
            ← Önceki
          </Link>
        ) : (
          <span className="border border-line px-3 py-1.5 opacity-40">← Önceki</span>
        )}
        <span>
          {page} / {pageCount}
        </span>
        {page < pageCount ? (
          <Link href={hrefFor(page + 1)} className="border border-line bg-white px-3 py-1.5 hover:border-ink">
            Sonraki →
          </Link>
        ) : (
          <span className="border border-line px-3 py-1.5 opacity-40">Sonraki →</span>
        )}
      </div>
    </div>
  );
}
