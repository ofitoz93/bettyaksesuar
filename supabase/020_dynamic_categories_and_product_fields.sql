-- Faz 3 (Katalog): sabit kategori listesini admin tarafından yönetilebilir,
-- alt kategori destekli dinamik bir tabloya taşır; ürünlere SEO/meta, vergi
-- sınıfı ve aktif/pasif (taslak) alanlarını ekler.
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-019'dan sonra).

-- ============ KATEGORİLER: category_images -> categories ============

alter table public.category_images rename to categories;
alter table public.categories rename column category to slug;

alter table public.categories
  add column if not exists name text,
  add column if not exists description text not null default '',
  add column if not exists parent_slug text,
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists meta_keywords text,
  add column if not exists sort_order int not null default 0;

insert into public.categories (slug, name, sort_order) values
  ('kolye', 'Kolyeler', 0),
  ('boncuk-kolye', 'Boncuk Kolyeler', 1),
  ('kupe', 'Küpeler', 2),
  ('bileklik', 'Bileklikler', 3),
  ('kelepce', 'Kelepçeler', 4),
  ('yuzuk', 'Yüzükler', 5),
  ('set', 'Setler', 6),
  ('saat', 'Saatler', 7),
  ('sahmeran', 'Şahmeranlar', 8),
  ('halhal', 'Halhallar', 9)
on conflict (slug) do update set
  name = excluded.name,
  sort_order = excluded.sort_order
  where public.categories.name is null;

update public.categories set name = slug where name is null;
alter table public.categories alter column name set not null;

alter table public.categories drop constraint if exists categories_parent_slug_fkey;
alter table public.categories
  add constraint categories_parent_slug_fkey
  foreign key (parent_slug) references public.categories (slug) on delete set null;

create index if not exists categories_parent_slug_idx on public.categories (parent_slug);

-- ============ ÜRÜNLER: kategori artık dinamik tabloya bağlı + yeni alanlar ============

alter table public.products drop constraint if exists products_category_check;
alter table public.products drop constraint if exists products_category_fkey;
alter table public.products
  add constraint products_category_fkey foreign key (category) references public.categories (slug);

alter table public.products
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists meta_keywords text,
  add column if not exists tax_class_percent numeric(5, 2) not null default 20,
  add column if not exists is_active boolean not null default true;
