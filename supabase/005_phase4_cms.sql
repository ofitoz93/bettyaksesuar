-- Faz 4: ana sayfa içeriği, sosyal medya linkleri ve kategori görselleri (CMS)
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-004'ten sonra).

-- ============ SİTE AYARLARI (ana sayfa içeriği + sosyal medya) ============

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  hero_image_url text,
  hero_eyebrow text not null default '2026 SONBAHAR KOLEKSİYONU',
  hero_heading text not null default 'Zarafetin
Yeni Adı',
  hero_subtitle text not null default 'Su geçirmez, kararmaz, 18 ayar altın kaplama. Günlük kullanım için tasarlanan, ömür boyu yanınızda olan takılar.',
  hero_primary_label text not null default 'Koleksiyonu Keşfet',
  hero_primary_href text not null default '/magaza',
  hero_secondary_label text not null default 'Çok Satanlar',
  hero_secondary_href text not null default '/cok-satanlar',
  instagram_url text,
  facebook_url text,
  pinterest_url text,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can update site settings" on public.site_settings;
create policy "Admins can update site settings"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============ KATEGORİ GÖRSELLERİ ============

create table if not exists public.category_images (
  category text primary key,
  image_url text,
  updated_at timestamptz not null default now()
);

alter table public.category_images enable row level security;

drop policy if exists "Public can read category images" on public.category_images;
create policy "Public can read category images"
  on public.category_images for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can write category images" on public.category_images;
create policy "Admins can write category images"
  on public.category_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
