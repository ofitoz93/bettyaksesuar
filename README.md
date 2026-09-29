# Verastone Aksesuar — TAKI Projesi

Modern, premium bir kadın takı & aksesuar e-ticaret sitesi. Next.js (App
Router) + TypeScript + Tailwind CSS ile geliştiriliyor.

## Bilgisayarınızda çalıştırma

Node.js kurulu olduğu için sadece şu iki komut yeterli:

```bash
npm install
npm run dev
```

Ardından tarayıcıda **http://localhost:3000** adresini açın.

Üretim (production) derlemesini denemek isterseniz:

```bash
npm run build
npm run start
```

## Bu ilk teslimatta neler var

Şu an sitenin **ana sayfası** gerçek Next.js koduna dönüştürüldü — daha önce
tasarım aracında onayladığımız görünümün birebir aynısı: tam genişlikte hero
görseli, üzerine binen şeffaf menü, kategori ızgarası, çok satanlar, kampanya
bandı, gravür bölümü, yorumlar, Instagram şeridi, bülten kaydı ve footer.

Ürün isimleri/fiyatları ve yorumlar şu an **örnek veridir**
(`lib/data/products.ts`) — ileride gerçek veritabanından gelecek.

## Proje mimarisi (öneri)

Bu bölüm, projenin genel planını özetler; her fazda güncellenecektir.

**Genel yapı:** Next.js App Router, tek proje (monorepo değil). `app/` sayfa
rotalarını, `components/` yeniden kullanılabilir arayüz parçalarını, `lib/`
veri/yardımcı fonksiyonları barındırır.

**Planlanan sayfa yapısı:**
- `/` — Ana sayfa (hazır)
- `/magaza` — Ürün listeleme, filtreleme, sıralama
- `/urun/[slug]` — Ürün detay sayfası
- `/koleksiyonlar`, `/yeni-gelenler`, `/cok-satanlar`
- `/hakkimizda`, `/iletisim`
- `/sepet`, `/odeme` (checkout)
- `/hesabim`, `/hesabim/siparisler` (üyelik & sipariş geçmişi)
- `/admin/*` — Yönetim paneli (ayrı, korumalı bir bölüm)

**Component mimarisi:** `components/ui` (Button, Badge, ProductCard gibi
küçük, tekrar kullanılabilir parçalar), `components/sections` (ana sayfa ve
diğer sayfalardaki büyük bölümler), `components/layout` (Header/Footer gibi
sayfa iskeleti).

**Önerilen teknoloji seçimleri:**
- Next.js + TypeScript + Tailwind CSS (frontend) — kuruldu
- **Supabase** (Postgres + Auth + Storage) — veritabanı, üyelik ve ürün
  görseli depolama için düşük maliyetli, ileride ölçeklenebilir bir seçim
  (bilgisayarınızda Supabase CLI kurulu olduğunu gördük, bu yüzden pratik bir
  başlangıç noktası)
- Sepet durumu için hafif bir state yönetimi (Zustand veya React Context)
- Ödeme için Türkiye'de yaygın kullanılan bir sağlayıcı (örn. iyzico)
- Barındırma: geliştirme aşamasında localhost, yayına almak için Vercel

**Veritabanı yapısı (taslak):** `products`, `product_variants`,
`categories`, `customers`, `orders`, `order_items`, `coupons`, `reviews`.

**Kullanıcı akışı (taslak):** Ana sayfa → ürün listeleme/filtreleme → ürün
detay → sepete ekle → sepet → ödeme (misafir veya üyelik ile) → sipariş
onayı → hesabım/sipariş geçmişi. Admin tarafında ayrı bir giriş ve ürün /
sipariş / stok / kupon yönetimi akışı.

## Sıradaki adımlar

1. Diğer sayfaların (mağaza, ürün detay, sepet, ödeme) gerçek koda
   dönüştürülmesi
2. Supabase ile veritabanı bağlantısının kurulması (ürünler artık örnek veri
   değil, gerçek veriden gelecek)
3. Admin panelinin gerçek koda dönüştürülüp veritabanına bağlanması
