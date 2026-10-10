"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export interface ListFilter {
  name: string;
  label: string;
  options: { value: string; label: string }[];
}

// Admin listeleri için arama + filtre çubuğu. Değerler URL'e yazılır (?q=..&status=..),
// böylece sayfa sunucuda filtrelenir ve link paylaşılabilir / geri tuşu çalışır.
export default function ListToolbar({
  placeholder,
  filters = [],
  keepParams = [],
}: {
  placeholder: string;
  filters?: ListFilter[];
  // "Temizle"ye basınca korunacak parametreler (örn. aktif sekme)
  keepParams?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const pushParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("sayfa");
    startTransition(() => {
      router.replace(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
    });
  };

  // Yazmayı bıraktıktan 300ms sonra ara
  useEffect(() => {
    if (query === (searchParams.get("q") ?? "")) return;
    const timer = setTimeout(() => pushParams({ q: query.trim() }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const hasActive = Boolean(searchParams.get("q")) || filters.some((f) => searchParams.get(f.name));

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-1 basis-56">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-line bg-white py-2 pr-8 pl-3 text-sm outline-none focus:border-ink"
        />
        {pending && (
          <span className="absolute top-1/2 right-3 h-3 w-3 -translate-y-1/2 animate-spin rounded-full border border-ink-faint border-t-transparent" />
        )}
      </div>
      {filters.map((filter) => (
        <select
          key={filter.name}
          value={searchParams.get(filter.name) ?? ""}
          onChange={(e) => pushParams({ [filter.name]: e.target.value })}
          className="border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink"
          aria-label={filter.label}
        >
          <option value="">{filter.label}: Tümü</option>
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
      {hasActive && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            const kept = new URLSearchParams();
            for (const key of keepParams) {
              const value = searchParams.get(key);
              if (value) kept.set(key, value);
            }
            startTransition(() =>
              router.replace(`${pathname}${kept.size ? `?${kept}` : ""}`, { scroll: false }),
            );
          }}
          className="px-2 py-2 text-xs text-ink-soft underline hover:text-ink"
        >
          Temizle
        </button>
      )}
    </div>
  );
}
