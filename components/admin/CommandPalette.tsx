"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { adminSearch, type AdminSearchResult } from "@/app/admin/search";
import { ADMIN_NAV } from "./adminNav";

interface PaletteItem {
  group: string;
  title: string;
  subtitle?: string;
  href: string;
}

// Menüdeki tüm sayfalar — veritabanına gitmeden anında filtrelenir
const PAGE_ITEMS: PaletteItem[] = ADMIN_NAV.flatMap((group) => [
  ...(group.href ? [{ group: "Sayfalar", title: group.label, href: group.href }] : []),
  ...group.links.map((link) => ({
    group: "Sayfalar",
    title: link.label,
    subtitle: group.label,
    href: link.href,
  })),
]);

function normalize(value: string) {
  return value.toLocaleLowerCase("tr-TR");
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [remote, setRemote] = useState<AdminSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl+K / Cmd+K ile aç-kapat
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("admin-search-open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("admin-search-open", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Yazmayı bıraktıktan 250ms sonra veritabanında ara
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      const results = await adminSearch(q);
      if (!cancelled) {
        setRemote(results);
        setActive(0);
        setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const items: PaletteItem[] = useMemo(() => {
    const q = normalize(query.trim());
    const pages = q
      ? PAGE_ITEMS.filter((item) => normalize(`${item.title} ${item.subtitle ?? ""}`).includes(q))
      : PAGE_ITEMS.slice(0, 8);
    return [...(q.length >= 2 ? remote : []), ...pages.slice(0, 6)];
  }, [query, remote]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setRemote([]);
    setActive(0);
  };

  const go = (item: PaletteItem) => {
    close();
    router.push(item.href);
  };

  if (!open) return null;

  let lastGroup = "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 pt-[12vh]"
      onClick={close}
    >
      <div
        role="dialog"
        aria-label="Hızlı arama"
        className="w-full max-w-xl border border-line bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <span className="text-ink-faint">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(i + 1, items.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              }
              if (e.key === "Enter" && items[active]) go(items[active]);
            }}
            placeholder="Sipariş, ürün, müşteri veya sayfa ara..."
            className="w-full py-4 text-sm outline-none"
          />
          {loading && (
            <span className="h-3 w-3 shrink-0 animate-spin rounded-full border border-ink-faint border-t-transparent" />
          )}
          <kbd className="shrink-0 border border-line px-1.5 py-0.5 text-[10px] text-ink-faint">ESC</kbd>
        </div>

        <ul className="max-h-[60vh] overflow-y-auto py-2">
          {items.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-ink-faint">
              {query.trim().length < 2 ? "Aramak için yazmaya başlayın" : "Sonuç bulunamadı"}
            </li>
          )}
          {items.map((item, i) => {
            const showGroup = item.group !== lastGroup;
            lastGroup = item.group;
            return (
              <li key={`${item.group}-${item.href}-${i}`}>
                {showGroup && (
                  <div className="px-4 pt-3 pb-1 text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                    {item.group}
                  </div>
                )}
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(item)}
                  className={`flex w-full items-center justify-between gap-4 px-4 py-2 text-left text-sm ${
                    i === active ? "bg-ivory-deep" : ""
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{item.title}</span>
                    {item.subtitle && (
                      <span className="block truncate text-xs text-ink-faint">{item.subtitle}</span>
                    )}
                  </span>
                  {i === active && <span className="shrink-0 text-xs text-ink-faint">↵</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
