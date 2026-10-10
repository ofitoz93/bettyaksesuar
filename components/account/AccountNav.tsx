"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { customerLogout } from "@/app/hesabim/actions";

const LINKS = [
  { href: "/hesabim", label: "Genel Bakış", exact: true },
  { href: "/hesabim/profil", label: "Profilim" },
  { href: "/hesabim/adreslerim", label: "Adreslerim" },
  { href: "/hesabim/siparislerim", label: "Siparişlerim" },
  { href: "/favoriler", label: "Favorilerim" },
];

export default function AccountNav({ firstName, isAdmin }: { firstName: string; isAdmin: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside>
      <div className="mb-5">
        <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
          HESABIM
        </div>
        <div className="font-display mt-1.5 text-2xl">Merhaba, {firstName}</div>
      </div>

      {/* Mobilde yatay kaydırılabilir sekmeler, masaüstünde dikey menü */}
      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-col md:gap-0 md:overflow-visible md:px-0 md:pb-0">
        {LINKS.map((link) => {
          const active = isActive(link.href, link.exact);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 border px-4 py-2 text-sm whitespace-nowrap md:border-0 md:border-l-2 md:px-4 md:py-2.5 ${
                active
                  ? "border-ink bg-ink text-ivory md:border-gold-deep md:bg-transparent md:text-ink"
                  : "border-line text-ink-soft hover:text-ink md:border-transparent"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className="shrink-0 border border-gold-deep px-4 py-2 text-sm whitespace-nowrap text-gold-deep md:mt-4 md:border-0 md:border-l-2 md:border-transparent md:py-2.5"
          >
            Yönetim Paneli →
          </Link>
        )}

        <form action={customerLogout} className="shrink-0 md:mt-4 md:border-t md:border-line md:pt-4">
          <button
            type="submit"
            className="border border-line px-4 py-2 text-sm whitespace-nowrap text-ink-soft hover:text-status-red-fg md:border-0 md:border-l-2 md:border-transparent md:py-2.5"
          >
            Çıkış Yap
          </button>
        </form>
      </nav>
    </aside>
  );
}
