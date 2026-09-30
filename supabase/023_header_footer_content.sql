-- Faz 4 (Tema Düzeni): header menü linkleri ve footer içerik/link grupları
-- admin panelinden düzenlenebilir hale getirilir. Varsayılanlar, sitede o an
-- kodda sabit olan değerlerle aynıdır — bu migration görsel bir değişiklik yapmaz.
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-022'den sonra).

alter table public.site_settings
  add column if not exists header_primary_links jsonb not null default '[
    {"label":"KOLYE","href":"/magaza?kategori=kolye"},
    {"label":"KÜPE","href":"/magaza?kategori=kupe"},
    {"label":"BİLEKLİK","href":"/magaza?kategori=bileklik"},
    {"label":"YÜZÜK","href":"/magaza?kategori=yuzuk"}
  ]'::jsonb,
  add column if not exists header_secondary_links jsonb not null default '[
    {"label":"YENİ GELENLER","href":"/yeni-gelenler"},
    {"label":"İNDİRİM","href":"/indirimli-urunler"},
    {"label":"TÜM ÜRÜNLER","href":"/magaza"}
  ]'::jsonb,
  add column if not exists footer_description text not null default
    'Su geçirmez, kararmaz çelik takılar. Günlük kullanım için tasarlandı, ömür boyu yanınızda.',
  add column if not exists footer_help_links jsonb not null default '[
    {"label":"Sıkça Sorulan Sorular","href":"/sss"},
    {"label":"Kargo & Teslimat","href":"/kargo-teslimat"},
    {"label":"Garanti & Bakım","href":"/garanti-bakim"},
    {"label":"İade & Değişim","href":"/iade-degisim"},
    {"label":"Mesafeli Satış Sözleşmesi","href":"/mesafeli-satis-sozlesmesi"}
  ]'::jsonb,
  add column if not exists footer_company_links jsonb not null default '[
    {"label":"Hakkımızda","href":"/hakkimizda"},
    {"label":"İletişim","href":"/iletisim"}
  ]'::jsonb;
