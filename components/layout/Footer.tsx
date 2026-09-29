import Image from "next/image";
import Link from "next/link";
import { categoryLabels, PRODUCT_CATEGORIES } from "@/components/ui/CategoryIcon";
import { getSiteSettings } from "@/lib/data/siteSettings";

const helpLinks: { label: string; href: string }[] = [
  { label: "Sıkça Sorulan Sorular", href: "/sss" },
  { label: "Kargo & Teslimat", href: "/kargo-teslimat" },
  { label: "Garanti & Bakım", href: "/garanti-bakim" },
  { label: "İade & Değişim", href: "/iade-degisim" },
];

const companyLinks: { label: string; href: string }[] = [
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "İletişim", href: "/iletisim" },
];

const collectionLinks: { label: string; href: string }[] = PRODUCT_CATEGORIES.map(
  (category) => ({
    label: categoryLabels[category],
    href: `/magaza?kategori=${category}`,
  }),
);

const shoppingLinks: { label: string; href: string }[] = [
  { label: "Yeni Gelenler", href: "/yeni-gelenler" },
  { label: "İndirimli Ürünler", href: "/indirimli-urunler" },
  { label: "Çok Satanlar", href: "/cok-satanlar" },
  { label: "Tüm Ürünler", href: "/magaza" },
];

export default async function Footer() {
  const settings = await getSiteSettings();
  const socialLinks = [
    { key: "instagram", href: settings.instagramUrl, label: "Instagram" },
    { key: "facebook", href: settings.facebookUrl, label: "Facebook" },
    { key: "pinterest", href: settings.pinterestUrl, label: "Pinterest" },
  ].filter((link): link is { key: string; href: string; label: string } => Boolean(link.href));

  return (
    <footer className="border-t border-line bg-ivory-deep px-8 pt-18 pb-7">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 pb-13 sm:grid-cols-2 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
          <div>
            {settings.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt={settings.siteName}
                width={340}
                height={340}
                className="mb-3.5 h-40 w-auto object-contain"
              />
            ) : (
              <div className="font-display mb-3.5 text-[23px] tracking-[0.24em]">
                {settings.siteName}
              </div>
            )}
            <p className="max-w-[260px] text-[13px] leading-relaxed text-ink-soft">
              Su geçirmez, kararmaz çelik takılar. Günlük kullanım için
              tasarlandı, ömür boyu yanınızda.
            </p>
            {socialLinks.length > 0 && (
              <div className="mt-[22px] flex gap-3.5">
                {socialLinks.map((social) => (
                  <a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-line"
                  >
                    <SocialIcon name={social.key} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <FooterColumn title="Alışveriş" links={shoppingLinks} />
          <FooterColumn title="Koleksiyonlar" links={collectionLinks} />
          <FooterColumn title="Yardım" links={helpLinks} />
          <FooterColumn title="Kurumsal" links={companyLinks} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3.5 border-t border-line pt-6">
          <div className="text-xs text-ink-soft">
            © {new Date().getFullYear()} {settings.siteName} {settings.siteTagline}. Tüm
            hakları saklıdır.
          </div>
          <div className="flex flex-wrap gap-[22px]">
            <Link href="/gizlilik" className="text-xs text-ink-soft">
              Gizlilik Politikası
            </Link>
            <Link href="/kullanim-sartlari" className="text-xs text-ink-soft">
              Kullanım Şartları
            </Link>
            <Link href="/cerez-tercihleri" className="text-xs text-ink-soft">
              Çerez Tercihleri
            </Link>
          </div>
          <div className="text-[11px] tracking-wide text-ink-soft">
            Kredi Kartı · Kapıda Ödeme · Havale/EFT
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: string }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
  };

  if (name === "instagram") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
      </svg>
    );
  }

  if (name === "facebook") {
    return (
      <svg {...common}>
        <path d="M15 8h-2a2 2 0 0 0-2 2v2H9v3h2v6h3v-6h2.2L16.7 12H14v-1.6c0-.5.3-.9 1-.9h1.5V8Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M9 20c1-4 1.5-8.5 1-12" />
      <path d="M6.5 12c0-4 3-6 6-6 3.2 0 5.5 2.1 5.5 5.2 0 3.6-2 6.3-5 6.3-1.3 0-2.2-.6-2.6-1.4" />
    </svg>
  );
}

interface FooterLink {
  label: string;
  href: string;
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <div className="mb-[18px] text-[11px] tracking-[0.14em] text-gold-deep uppercase">
        {title}
      </div>
      <div className="flex flex-col gap-3">
        {links.map((link) => (
          <Link key={link.label} href={link.href} className="text-[13.5px] text-ink-soft">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
