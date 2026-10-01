"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ADMIN_NAV } from "./adminNav";

export default function AdminSidebar({
  pendingStock,
  pendingReturns,
}: {
  pendingStock: number;
  pendingReturns: number;
}) {
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const badgeValue = (key?: "pendingStock" | "pendingReturns") => {
    if (key === "pendingStock") return pendingStock;
    if (key === "pendingReturns") return pendingReturns;
    return 0;
  };

  return (
    <nav className="flex w-60 shrink-0 flex-col gap-1 border-r border-line bg-white px-3 py-5 text-sm">
      {ADMIN_NAV.map((group) => {
        if (group.href) {
          const active = pathname === group.href;
          return (
            <Link
              key={group.label}
              href={group.href}
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
  );
}
