-- Faz 9: Blog yönetimi + XML/Universal ürün veri akışı ayarı
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-024'ten sonra).

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null default '',
  image_url text,
  author text,
  meta_title text,
  meta_description text,
  meta_keywords text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx on public.blog_posts (is_published, created_at desc);

alter table public.blog_posts enable row level security;

drop policy if exists "Public can read published posts" on public.blog_posts;
create policy "Public can read published posts"
  on public.blog_posts for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Admins can read all posts" on public.blog_posts;
create policy "Admins can read all posts"
  on public.blog_posts for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can write posts" on public.blog_posts;
create policy "Admins can write posts"
  on public.blog_posts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============ XML / UNIVERSAL ÜRÜN VERİ AKIŞI ============

alter table public.store_settings
  add column if not exists xml_feed_enabled boolean not null default true;
