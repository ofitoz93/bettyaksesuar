"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/admin/actions";

export default function AdminUserMenu({ displayName }: { displayName: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs tracking-wide text-ink-soft hover:text-ink"
      >
        {displayName}
        <span className="text-[10px]">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-52 border border-line bg-white py-1.5 shadow-md">
          <Link
            href="/admin/sistem/profil"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-xs tracking-wide text-ink-soft hover:bg-ivory-deep hover:text-ink"
          >
            Profil Ayarları
          </Link>
          <Link
            href="/admin/sistem/magaza"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-xs tracking-wide text-ink-soft hover:bg-ivory-deep hover:text-ink"
          >
            Mağaza Ayarları
          </Link>
          <form action={logout} className="border-t border-line">
            <button
              type="submit"
              className="block w-full px-4 py-2.5 text-left text-xs tracking-wide text-ink-soft hover:bg-ivory-deep hover:text-ink"
            >
              Çıkış Yap
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
