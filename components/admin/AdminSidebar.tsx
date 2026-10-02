"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ADMIN_NAV } from "./adminNav";

export default function AdminSidebar({
  pendingStock,
  pendingReturns,
  mobileOpen = false,
  onNavigate,
}: {
  pendingStock: number;
  pendingReturns: number;
  mobileOpen?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const badgeValue = (key?: "pendingStock" | "pendingReturns") => {
    if (key === "pendingStock") return pendingStock;
    if (key === "pendingReturns") return pendingReturns;
    return 0;
  };

  const close = () => onNavigate?.();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}
      <nav
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col gap-1 overflow-y-auto border-r border-line bg-white px-3 py-5 text-sm transition-transform duration-200 lg:static lg:z-auto lg:w-60 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {ADMIN_NAV.map((group) => {
          if (group.href) {
            const active = pathname === group.href;
            return (
              <Link
                key={group.label}
                href={group.href}
                onClick={close}
                className={`px-3 py-2.5 text-xs font-medium tracking-wide uppercase ${
                  active ? "bg-ink text-ivory" : "text-ink-soft hover:bg-ivory-deep"
                }`}
              >
                {group.label}
              </Link>
            );
          }

          const isCollapsed = collapsedGroups[group.label] ?? true;

          return (
            <div key={group.label} className="mt-1">
              <button
                type="button"
                onClick={() =>
                  setCollapsedGroups((prev) => ({ ...prev, [group.label]: !isCollapsed }))
                }
                className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-medium tracking-[0.12em] text-ink-faint uppercase hover:text-ink"
              >
                {group.label}
                <span>{isCollapsed ? "+" : "–"}</span>
              </button>
              {!isCollapsed && (
                <div className="flex flex-col gap-0.5">
                  {group.links.map((link) => {
                    const active = pathname === link.href;
                    const badge = badgeValue(link.badgeKey);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={close}
                        className={`flex items-center justify-between px-3 py-2 text-[13px] ${
                          active ? "bg-ivory-deep text-ink" : "text-ink-soft hover:bg-ivory-deep"
                        }`}
                      >
                        {link.label}
                        {badge > 0 && (
                          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-deep px-1 text-[10px] font-medium text-white">
                            {badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}
