import Link from "next/link";
import { getAllContentPages } from "@/lib/data/contentPages";

export default async function SayfalarAyarlarPage() {
  const pages = await getAllContentPages();

  return (
    <div>
      <h1 className="font-display mb-2 text-[28px]">Sayfalar</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Footer&apos;da linki verilen yardım, kurumsal ve yasal sayfaların metinlerini
        buradan düzenleyin.
      </p>

      <div className="flex flex-col divide-y divide-line border-y border-line bg-white">
        {pages.map((page) => (
          <div key={page.slug} className="flex items-center justify-between px-5 py-4">
            <div>
              <div className="text-sm">{page.title}</div>
              <div className="text-xs text-ink-faint">/{page.slug}</div>
            </div>
            <Link
              href={`/admin/ayarlar/sayfalar/${page.slug}`}
              className="text-xs tracking-wide text-ink-soft hover:text-ink"
            >
              Düzenle
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
