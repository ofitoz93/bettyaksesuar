"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

export default function SearchBox({ solid }: { solid?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, price, product_images(url, position)")
        .ilike("name", `%${trimmed}%`)
        .limit(6);

      const mapped: SearchResult[] = (data ?? []).map((row) => {
        const images = (
          row.product_images as { url: string; position: number }[] | null
        )?.slice().sort((a, b) => a.position - b.position);
        return {
          id: row.id,
          name: row.name,
          slug: row.slug,
          price: Number(row.price),
          image: images?.[0]?.url ?? null,
        };
      });

      setResults(mapped);
      setLoading(false);
    }, 300);
  };

  const goToResults = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    router.push(`/magaza?ara=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Ürün ara"
        className={solid ? "text-ink" : "text-ivory"}
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.2" y2="16.2" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 z-30 mt-3 w-80 border border-line bg-white shadow-lg sm:w-96">
          <div className="border-b border-line p-3">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") goToResults();
              }}
              placeholder="Ürün adı yazın..."
              className="w-full px-2 py-1.5 text-sm text-ink outline-none"
            />
          </div>

          {query.trim().length >= 2 && (
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <p className="px-4 py-4 text-xs text-ink-soft">Aranıyor...</p>
              ) : results.length === 0 ? (
                <p className="px-4 py-4 text-xs text-ink-soft">Sonuç bulunamadı.</p>
              ) : (
                results.map((result) => (
                  <Link
                    key={result.id}
                    href={`/urun/${result.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-ivory-deep"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-linear-to-br from-[#EDE3D2] to-[#D9C7A6]">
                      {result.image && (
                        <Image src={result.image} alt="" fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 text-sm text-ink">{result.name}</div>
                    <div className="text-xs text-ink-soft">₺{result.price}</div>
                  </Link>
                ))
              )}
              <button
                type="button"
                onClick={goToResults}
                className="block w-full border-t border-line px-4 py-2.5 text-center text-xs tracking-wide text-ink-soft uppercase hover:text-ink"
              >
                Tüm Sonuçları Gör
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
