"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const SORT_OPTIONS = [
  { value: "onerilen", label: "Önerilen" },
  { value: "cok-satan", label: "Çok Satanlar" },
  { value: "fiyat-artan", label: "Fiyat: Düşükten Yükseğe" },
  { value: "fiyat-azalan", label: "Fiyat: Yüksekten Düşüğe" },
];

export default function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sort = searchParams.get("sirala") ?? "onerilen";
  const hideOutOfStock = searchParams.get("stokta") === "1";

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
      <label className="flex items-center gap-2 text-xs text-ink-soft">
        <input
          type="checkbox"
          checked={hideOutOfStock}
          onChange={(e) => updateParam("stokta", e.target.checked ? "1" : null)}
          className="h-4 w-4"
        />
        Stokta olmayanları gizle
      </label>

      <label className="flex items-center gap-2 text-xs text-ink-soft">
        Sırala:
        <select
          value={sort}
          onChange={(e) => updateParam("sirala", e.target.value)}
          className="border border-line bg-white px-3 py-1.5 text-xs outline-none focus:border-ink"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
