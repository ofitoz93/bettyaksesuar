-- Hero bölümü için çoklu görsel (carousel) desteği
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-006'dan sonra).

create table if not exists public.hero_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.hero_images enable row level security;

drop policy if exists "Public can read hero images" on public.hero_images;
create policy "Public can read hero images"
  on public.hero_images for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can write hero images" on public.hero_images;
create policy "Admins can write hero images"
  on public.hero_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Mevcut tek hero görselini yeni tabloya taşı
insert into public.hero_images (image_url, position)
select hero_image_url, 0
from public.site_settings
where id = 1 and hero_image_url is not null
  and not exists (select 1 from public.hero_images);
