import Image from "next/image";
import Link from "next/link";
import CartLink from "./CartLink";
import SearchBox from "./SearchBox";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/data/siteSettings";

const primaryNav: { label: string; href: string }[] = [
  { label: "KOLYE", href: "/magaza?kategori=kolye" },
  { label: "KÜPE", href: "/magaza?kategori=kupe" },
  { label: "BİLEKLİK", href: "/magaza?kategori=bileklik" },
  { label: "YÜZÜK", href: "/magaza?kategori=yuzuk" },
];

const secondaryNav: { label: string; href: string }[] = [
  { label: "YENİ GELENLER", href: "/yeni-gelenler" },
  { label: "İNDİRİM", href: "/indirimli-urunler" },
  { label: "TÜM ÜRÜNLER", href: "/magaza" },
];

interface HeaderProps {
  variant?: "transparent" | "solid";
}

export default async function Header({ variant = "transparent" }: HeaderProps) {
  const isSolid = variant === "solid";
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    settings,
  ] = await Promise.all([supabase.auth.getUser(), getSiteSettings()]);
  const accountHref = user ? "/hesabim" : "/hesabim/giris";

  return (
    <header
      className={
        isSolid
          ? "sticky top-0 z-20 border-b border-line bg-ivory text-ink"
          : "absolute inset-x-0 top-0 z-20 text-ivory"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-8 py-2">
        <div className="hidden items-center gap-7 md:flex">
          <SearchBox solid={isSolid} />
          <nav className="flex items-center gap-6">
            {primaryNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={
                  isSolid
                    ? "text-[13px] tracking-wide text-ink hover:text-gold-deep"
                    : "text-[13px] tracking-wide text-ivory hover:text-gold"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <Link href="/" className="text-center">
          {settings.logoUrl ? (
            <Image
              src={settings.logoUrl}
              alt={settings.siteName}
              width={340}
              height={340}
              priority
              className="mx-auto h-36 w-auto object-contain"
            />
          ) : (
            <>
              <div className="font-display text-[27px] tracking-[0.28em]">
                {settings.siteName}
              </div>
              <div
                className={
                  isSolid
                    ? "mt-0.5 text-[9px] tracking-[0.42em] text-gold-deep"
                    : "mt-0.5 text-[9px] tracking-[0.42em] text-gold"
                }
              >
                {settings.siteTagline}
              </div>
            </>
          )}
        </Link>

        <div className="flex items-center gap-5">
          <nav className="hidden items-center gap-6 md:flex">
            {secondaryNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={
                  isSolid
                    ? "text-[13px] tracking-wide text-ink hover:text-gold-deep"
                    : "text-[13px] tracking-wide text-ivory hover:text-gold"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href={accountHref} aria-label="Hesabım">
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.4}
              strokeLinecap="round"
            >
              <path d="M20 21c0-3.9-3.6-7-8-7s-8 3.1-8 7" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
          <CartLink solid={isSolid} />
        </div>
      </div>
    </header>
  );
}
