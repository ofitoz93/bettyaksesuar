-- Toptancı ürün havuzu: toplu ürün ekleme artık doğrudan satışa değil,
-- admin panelindeki ayrı bir havuza düşer (stok/fiyat/kategori istenmez).
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-014'ten sonra).

create table if not exists public.wholesale_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text,
  created_at timestamptz not null default now()
);

create table if not exists public.wholesale_product_images (
  id uuid primary key default gen_random_uuid(),
  wholesale_product_id uuid not null references public.wholesale_products (id) on delete cascade,
  -- "wholesale-images" bucket'ı özel (public değil) olduğu için burada tam url değil,
  -- storage path saklanır; görüntülenirken/indirilirken signed url üretilir.
  path text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists wholesale_product_images_product_idx
  on public.wholesale_product_images (wholesale_product_id);

alter table public.wholesale_products enable row level security;
alter table public.wholesale_product_images enable row level security;

drop policy if exists "Authenticated can read wholesale products" on public.wholesale_products;
create policy "Authenticated can read wholesale products"
  on public.wholesale_products for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert wholesale products" on public.wholesale_products;
create policy "Authenticated can insert wholesale products"
  on public.wholesale_products for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can delete wholesale products" on public.wholesale_products;
create policy "Authenticated can delete wholesale products"
  on public.wholesale_products for delete
  to authenticated
  using (true);

drop policy if exists "Authenticated can read wholesale product images" on public.wholesale_product_images;
create policy "Authenticated can read wholesale product images"
  on public.wholesale_product_images for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert wholesale product images" on public.wholesale_product_images;
create policy "Authenticated can insert wholesale product images"
  on public.wholesale_product_images for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can delete wholesale product images" on public.wholesale_product_images;
create policy "Authenticated can delete wholesale product images"
  on public.wholesale_product_images for delete
  to authenticated
  using (true);

-- Toptancı havuzu fotoğrafları için ayrı, herkese kapalı bucket
insert into storage.buckets (id, name, public)
values ('wholesale-images', 'wholesale-images', false)
on conflict (id) do nothing;

drop policy if exists "Authenticated can view wholesale images" on storage.objects;
create policy "Authenticated can view wholesale images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'wholesale-images');

drop policy if exists "Authenticated can upload wholesale images" on storage.objects;
create policy "Authenticated can upload wholesale images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'wholesale-images');

drop policy if exists "Authenticated can delete wholesale images" on storage.objects;
create policy "Authenticated can delete wholesale images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'wholesale-images');
