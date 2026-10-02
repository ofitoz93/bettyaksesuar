"use client";

import Link from "next/link";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminUserMenu from "./AdminUserMenu";

export default function AdminShell({
  pendingStock,
  pendingReturns,
  displayName,
  children,
}: {
  pendingStock: number;
  pendingReturns: number;
  displayName: string;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-ivory-deep">
      <AdminSidebar
        pendingStock={pendingStock}
        pendingReturns={pendingReturns}
        mobileOpen={mobileNavOpen}
        onNavigate={() => setMobileNavOpen(false)}
      />
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Menüyü aç"
              className="flex h-8 w-8 shrink-0 items-center justify-center border border-line text-ink lg:hidden"
            >
              <span className="sr-only">Menü</span>
              ☰
            </button>
            <Link
              href="/admin"
              className="font-display truncate text-base tracking-[0.15em] sm:text-lg sm:tracking-[0.2em]"
            >
              BETTY <span className="text-gold-deep">ADMIN</span>
            </Link>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              target="_blank"
              className="hidden text-xs tracking-wide text-ink-soft hover:text-ink sm:inline-block"
            >
              Siteyi Görüntüle ↗
            </Link>
            <AdminUserMenu displayName={displayName} />
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
