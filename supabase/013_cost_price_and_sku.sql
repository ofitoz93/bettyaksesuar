-- Toplu ürün ekleme: alış fiyatı ve ürün kodu/barkod alanları
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-012'den sonra).

alter table public.products
  add column if not exists cost_price numeric,
  add column if not exists sku text;
