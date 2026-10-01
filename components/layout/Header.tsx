import Image from "next/image";
import Link from "next/link";
import CartLink from "./CartLink";
import AccountLink from "./AccountLink";
import SearchBox from "./SearchBox";
import { getSiteSettings } from "@/lib/data/siteSettings";

interface HeaderProps {
  variant?: "transparent" | "solid";
}

export default async function Header({ variant = "transparent" }: HeaderProps) {
  const isSolid = variant === "solid";
  const settings = await getSiteSettings();

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
            {settings.headerPrimaryLinks.map((item) => (
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
              style={{ height: settings.logoHeight, width: "auto" }}
              className="mx-auto object-contain"
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
            {settings.headerSecondaryLinks.map((item) => (
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
          <Link href="/favoriler" aria-label="Favorilerim">
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21s-7.5-4.6-10.1-9.3C.3 8.6 1.6 5 5 4a5 5 0 0 1 7 1.5A5 5 0 0 1 19 4c3.4 1 4.7 4.6 3.1 7.7C19.5 16.4 12 21 12 21Z" />
            </svg>
          </Link>
          <AccountLink />
          <CartLink solid={isSolid} />
        </div>
      </div>
    </header>
  );
}
