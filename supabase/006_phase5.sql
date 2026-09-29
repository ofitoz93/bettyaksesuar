-- Faz 5: marka kimliği, müşteri yorumları, sosyal medya görselleri, içerik sayfaları
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-005'ten sonra).

-- ============ SİTE KİMLİĞİ (site_settings'e ekleme) ============

alter table public.site_settings
  add column if not exists site_name text not null default 'VERASTONE',
  add column if not exists site_tagline text not null default 'AKSESUAR',
  add column if not exists logo_url text;

-- ============ MÜŞTERİ YORUMLARI ============

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  rating int not null default 5 check (rating between 1 and 5),
  quote text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

drop policy if exists "Public can read testimonials" on public.testimonials;
create policy "Public can read testimonials"
  on public.testimonials for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can write testimonials" on public.testimonials;
create policy "Admins can write testimonials"
  on public.testimonials for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.testimonials (author, rating, quote, position)
select * from (values
  ('Elif K.', 5, 'Kargo çok hızlı geldi, kalitesi beklediğimden çok daha iyi. Bir yıldır kullanıyorum, hâlâ pırıl pırıl duruyor.', 0),
  ('Zeynep A.', 5, 'Gravür seçeneği harikaydı, kız kardeşime doğum günü hediyesi olarak aldım, çok beğendi.', 1),
  ('Merve T.', 5, 'Suya dayanıklı olması en sevdiğim özelliği, dört mevsim çıkarmadan takabiliyorum.', 2)
) as seed(author, rating, quote, position)
where not exists (select 1 from public.testimonials);

-- ============ SOSYAL MEDYA (INSTAGRAM ŞERİDİ) GÖRSELLERİ ============

create table if not exists public.social_feed_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.social_feed_images enable row level security;

drop policy if exists "Public can read social feed images" on public.social_feed_images;
create policy "Public can read social feed images"
  on public.social_feed_images for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can write social feed images" on public.social_feed_images;
create policy "Admins can write social feed images"
  on public.social_feed_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============ İÇERİK SAYFALARI (SSS, kargo, garanti, iade, kurumsal, yasal) ============

create table if not exists public.content_pages (
  slug text primary key,
  title text not null,
  body text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.content_pages enable row level security;

drop policy if exists "Public can read content pages" on public.content_pages;
create policy "Public can read content pages"
  on public.content_pages for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can write content pages" on public.content_pages;
create policy "Admins can write content pages"
  on public.content_pages for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.content_pages (slug, title, body) values
  ('sss', 'Sıkça Sorulan Sorular', 'İçerik yakında eklenecek.'),
  ('kargo-teslimat', 'Kargo & Teslimat', 'İçerik yakında eklenecek.'),
  ('garanti-bakim', 'Garanti & Bakım', 'İçerik yakında eklenecek.'),
  ('iade-degisim', 'İade & Değişim', 'İçerik yakında eklenecek.'),
  ('hakkimizda', 'Hakkımızda', 'İçerik yakında eklenecek.'),
  ('iletisim', 'İletişim', 'İçerik yakında eklenecek.'),
  ('gizlilik', 'Gizlilik Politikası', 'İçerik yakında eklenecek.'),
  ('kullanim-sartlari', 'Kullanım Şartları', 'İçerik yakında eklenecek.'),
  ('cerez-tercihleri', 'Çerez Tercihleri', 'İçerik yakında eklenecek.')
on conflict (slug) do nothing;
