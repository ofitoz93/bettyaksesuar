-- Betty Aksesuar — Supabase şema
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın.

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null check (category in ('kolye', 'kupe', 'bileklik', 'yuzuk')),
  price numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2),
  discount_percent int,
  is_new boolean not null default false,
  is_best_seller boolean not null default false,
  description text,
  image_url text,
  stock int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_slug_idx on public.products (slug);

-- updated_at otomatik güncellensin
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Row Level Security: herkes okuyabilir, sadece giriş yapmış (admin) kullanıcı yazabilir
alter table public.products enable row level security;

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated can insert products" on public.products;
create policy "Authenticated can insert products"
  on public.products for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update products" on public.products;
create policy "Authenticated can update products"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete products" on public.products;
create policy "Authenticated can delete products"
  on public.products for delete
  to authenticated
  using (true);

-- Ürün görselleri için storage bucket
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Authenticated can upload product images" on storage.objects;
create policy "Authenticated can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "Authenticated can update product images" on storage.objects;
create policy "Authenticated can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Authenticated can delete product images" on storage.objects;
create policy "Authenticated can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

-- Örnek ürünler (isteğe bağlı — istemiyorsanız bu bloğu silin)
insert into public.products (slug, name, category, price, compare_at_price, discount_percent, is_new, is_best_seller, stock)
values
  ('zincir-kolye', 'Zincir Kolye', 'kolye', 449, null, null, true, true, 25),
  ('tas-detayli-kupe', 'Taş Detaylı Küpe', 'kupe', 329, null, null, false, true, 40),
  ('ince-bileklik', 'İnce Bileklik', 'bileklik', 399, 469, 15, false, true, 18),
  ('minimal-yuzuk', 'Minimal Yüzük', 'yuzuk', 289, null, null, false, true, 30)
on conflict (slug) do nothing;
