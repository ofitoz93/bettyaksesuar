export interface AdminNavLink {
  label: string;
  href: string;
  badgeKey?: "pendingStock" | "pendingReturns";
}

export interface AdminNavGroup {
  label: string;
  href?: string;
  links: AdminNavLink[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
  { label: "Kontrol Paneli", href: "/admin", links: [] },
  {
    label: "Katalog",
    links: [
      { label: "Kategoriler", href: "/admin/ayarlar/kategoriler" },
      { label: "Ürünler", href: "/admin/urunler" },
      { label: "Ürünler (Toplu)", href: "/admin/urun/toplu-ekle" },
      { label: "Toptancı Havuzu", href: "/admin/toptanci" },
      { label: "Üreticiler", href: "/admin/katalog/ureticiler" },
      { label: "Filtreler", href: "/admin/katalog/filtreler" },
      { label: "Özellikler", href: "/admin/katalog/ozellikler" },
      { label: "Seçenekler", href: "/admin/katalog/secenekler" },
      { label: "Abonelikler", href: "/admin/katalog/abonelikler" },
      { label: "Dosyalar", href: "/admin/katalog/dosyalar" },
      { label: "Müşteri Yorumları", href: "/admin/yorumlar" },
      { label: "Bilgi Sayfaları", href: "/admin/ayarlar/sayfalar" },
    ],
  },
  {
    label: "Satışlar",
    links: [
      { label: "Siparişler", href: "/admin/siparisler" },
      { label: "İadeler", href: "/admin/iadeler", badgeKey: "pendingReturns" },
      { label: "Stok Talepleri", href: "/admin/stok-talepleri", badgeKey: "pendingStock" },
    ],
  },
  { label: "Müşteriler", href: "/admin/musteriler", links: [] },
  {
    label: "Pazarlama",
    links: [
      { label: "Kampanya Popup'ı", href: "/admin/ayarlar/kampanya" },
      { label: "Hediye Çeki", href: "/admin/sistem/hediye-ceki" },
      { label: "WhatsApp Sipariş", href: "/admin/pazarlama/whatsapp" },
    ],
  },
  {
    label: "Kargo Takip",
    links: [
      { label: "Kargo Ücret Ayarları", href: "/admin/ayarlar" },
      { label: "Kargo Entegrasyonları", href: "/admin/kargo/entegrasyonlar" },
    ],
  },
  {
    label: "Eklentiler",
    links: [{ label: "Ödeme Yöntemleri", href: "/admin/eklentiler" }],
  },
  { label: "Raporlar", href: "/admin/raporlar", links: [] },
  {
    label: "Tema Düzeni",
    links: [
      { label: "Ana Sayfa", href: "/admin/ayarlar/anasayfa" },
      { label: "Üst Kısım (Header)", href: "/admin/tema/header" },
      { label: "Alt Kısım (Footer)", href: "/admin/tema/footer" },
      { label: "Kategori Görselleri", href: "/admin/ayarlar/kategoriler" },
      { label: "Sosyal Medya", href: "/admin/ayarlar/sosyal-medya" },
    ],
  },
  {
    label: "Sistem Ayarları",
    links: [
      { label: "Mağaza", href: "/admin/sistem/magaza" },
      { label: "Genel", href: "/admin/sistem/genel" },
      { label: "Yerel", href: "/admin/sistem/yerel" },
      { label: "Ürünler", href: "/admin/sistem/urunler" },
      { label: "Resimler", href: "/admin/sistem/resimler" },
      { label: "E-posta", href: "/admin/sistem/eposta" },
      { label: "Uyarı Mesajları", href: "/admin/sistem/uyarilar" },
      { label: "Sunucu", href: "/admin/sistem/sunucu" },
    ],
  },
];
