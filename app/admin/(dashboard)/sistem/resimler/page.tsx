import Link from "next/link";
import { getStoreSettings } from "@/lib/data/storeSettings";
import FaviconForm from "./FaviconForm";

export default async function ResimlerPage() {
  const settings = await getStoreSettings();

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Resimler</h1>

      <div className="mb-8 max-w-lg border border-line bg-white p-5">
        <h2 className="mb-1 text-sm font-medium">Mağaza Logosu</h2>
        <p className="mb-3 text-xs text-ink-soft">
          Logo, Mağaza Ayarları sayfasından yüklenir.
        </p>
        <Link
          href="/admin/sistem/magaza"
          className="text-xs tracking-wide text-ink underline hover:text-gold-deep"
        >
          Mağaza Ayarları&apos;na git →
        </Link>
      </div>

      <div className="max-w-lg border border-line bg-white p-5">
        <h2 className="mb-3 text-sm font-medium">Favicon</h2>
        <FaviconForm faviconUrl={settings.faviconUrl} />
      </div>
    </div>
  );
}
