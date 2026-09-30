import { getStoreSettings } from "@/lib/data/storeSettings";
import { updateXmlFeedEnabled } from "@/app/admin/actions";
import SectionVisibilityToggle from "@/components/admin/SectionVisibilityToggle";

export default async function VeriAkisiPage() {
  const settings = await getStoreSettings();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const feedUrl = `${siteUrl || "https://siteniz.com"}/urun-feed.xml`;

  return (
    <div>
      <h1 className="font-display mb-2 text-[28px]">Eklentiler — Ürün Veri Akışı (XML)</h1>
      <p className="mb-6 text-sm text-ink-soft">
        Bu adres, tüm aktif ürünlerinizi Google Merchant/Universal uyumlu XML formatında
        listeler. Fiyat karşılaştırma sitelerine (Cimri, Akakçe vb.) veya reklam
        platformlarına ürün yüklemek için bu bağlantıyı kullanabilirsiniz. İçerik günde
        bir kez otomatik olarak tazelenir.
      </p>

      <div className="mb-6 flex items-center gap-3 border border-line bg-white p-4">
        <code className="flex-1 truncate text-xs text-ink">{feedUrl}</code>
        <a
          href="/urun-feed.xml"
          target="_blank"
          className="shrink-0 border border-ink px-4 py-2 text-xs tracking-wide uppercase hover:bg-ivory-deep"
        >
          Görüntüle
        </a>
      </div>

      <SectionVisibilityToggle
        initialEnabled={settings.xmlFeedEnabled}
        onToggle={updateXmlFeedEnabled}
        label="Ürün veri akışını etkinleştir"
      />

      {!process.env.NEXT_PUBLIC_SITE_URL && (
        <p className="mt-4 text-xs text-status-amber-fg">
          NEXT_PUBLIC_SITE_URL ortam değişkeni tanımlı değil — bağlantılar tam adres
          yerine göreli olarak oluşacaktır, lütfen .env&apos;de ayarlayın.
        </p>
      )}
    </div>
  );
}
