export default function PerformansPage() {
  return (
    <div>
      <h1 className="font-display mb-2 text-[28px]">Performans</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Sitenin hızlı çalışması için varsayılan olarak aktif olan ayarlar aşağıda
        listelenmiştir. Bunlar otomatik uygulanır, ekstra bir işlem yapmanız gerekmez.
      </p>

      <div className="flex flex-col gap-4">
        <PerfItem
          title="Görsel Optimizasyonu"
          desc="Tüm ürün/kategori/blog görselleri Next.js Image ile otomatik olarak cihaza uygun boyutta ve modern formatta (WebP/AVIF) sunulur, orijinal boyutta indirilmez."
        />
        <PerfItem
          title="Ürün Veri Akışı Önbelleği"
          desc="XML ürün veri akışı (/urun-feed.xml) günde bir kez yeniden oluşturulur, her istekte veritabanına gidilmez."
        />
        <PerfItem
          title="Tekrarlanan Sorgu Birleştirme"
          desc="Aynı sayfa isteğinde birden fazla bileşen mağaza/site ayarlarını istediğinde, veritabanına yalnızca bir kez gidilir (istek başına önbellekleme)."
        />
        <PerfItem
          title="Kenar Ağı (Middleware) Kapsamı"
          desc="Oturum kontrolü ve bakım modu denetimi yalnızca gerekli görülen isteklerde çalışır; statik dosyalar (görsel, font, css/js) bu kontrolden muaf tutulur."
        />
      </div>

      <p className="mt-8 text-xs text-ink-faint">
        Not: Hesap/sepet simgesinin her ziyaretçi için anlık doğru görünmesi gerektiğinden
        (oturum açık mı, sepette ürün var mı vb.), mağaza sayfaları tam statik önbelleğe
        alınamaz — bu, doğruluk için bilinçli bir tercihtir.
      </p>
    </div>
  );
}

function PerfItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="border border-line bg-white p-5">
      <div className="mb-1 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-status-green-fg" />
        <h2 className="text-sm font-medium">{title}</h2>
      </div>
      <p className="text-xs text-ink-soft">{desc}</p>
    </div>
  );
}
