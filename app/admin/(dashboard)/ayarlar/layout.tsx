import Link from "next/link";

const tabs = [
  { label: "Kargo", href: "/admin/ayarlar" },
  { label: "Ana Sayfa İçeriği", href: "/admin/ayarlar/anasayfa" },
  { label: "Kategoriler", href: "/admin/ayarlar/kategoriler" },
  { label: "Sosyal Medya Görselleri", href: "/admin/ayarlar/sosyal-medya" },
  { label: "Sayfalar", href: "/admin/ayarlar/sayfalar" },
  { label: "Kampanya Popup'ı", href: "/admin/ayarlar/kampanya" },
];

export default function AyarlarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-8 flex gap-6 border-b border-line">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="border-b-2 border-transparent pb-3 text-xs tracking-wide text-ink-soft hover:border-ink hover:text-ink"
          >
            {tab.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
