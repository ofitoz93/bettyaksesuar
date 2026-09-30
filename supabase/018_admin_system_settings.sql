-- Admin panel yeniden yapılandırması: Sistem Ayarları (mağaza/genel/yerel/ürün/
-- yorum/e-posta/uyarı/sunucu) + müşteri listesi için gerekli şema.
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-017'den sonra).

-- ============ PROFİL: kullanıcı adı ============

alter table public.profiles
  add column if not exists username text;

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

-- ============ MAĞAZA AYARLARI (herkese açık okunur — favicon/meta/para birimi vb. sitede kullanılır) ============

create table if not exists public.store_settings (
  id int primary key default 1 check (id = 1),
  store_name text not null default 'Betty Aksesuar',
  store_owner text,
  store_address text,
  store_email text,
  store_phone text,
  favicon_url text,
  meta_title text not null default 'Betty Aksesuar',
  meta_description text,
  meta_keywords text,
  locale_country text not null default 'Türkiye',
  locale_region text,
  locale_city text,
  currency_code text not null default 'TRY',
  currency_symbol text not null default '₺',
  currency_exchange_rate numeric(10, 4) not null default 1,
  currency_updated_at timestamptz,
  products_per_page int not null default 24,
  show_category_product_count boolean not null default true,
  allow_reviews boolean not null default true,
  allow_guest_reviews boolean not null default false,
  gift_cards_enabled boolean not null default false,
  maintenance_mode boolean not null default false,
  seo_url_enabled boolean not null default true,
  ssl_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id) values (1) on conflict (id) do nothing;

alter table public.store_settings enable row level security;

drop policy if exists "Public can read store settings" on public.store_settings;
create policy "Public can read store settings"
  on public.store_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can update store settings" on public.store_settings;
create policy "Admins can update store settings"
  on public.store_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============ BİLDİRİM AYARLARI (SMTP şifresi içerdiği için yalnızca admin okur/yazar) ============

create table if not exists public.notification_settings (
  id int primary key default 1 check (id = 1),
  smtp_host text,
  smtp_username text,
  smtp_password text,
  smtp_port int,
  smtp_timeout int not null default 30,
  alert_new_customer boolean not null default false,
  alert_new_order boolean not null default true,
  alert_new_review boolean not null default false,
  alert_extra_email text,
  updated_at timestamptz not null default now()
);

insert into public.notification_settings (id) values (1) on conflict (id) do nothing;

alter table public.notification_settings enable row level security;

drop policy if exists "Admins can read notification settings" on public.notification_settings;
create policy "Admins can read notification settings"
  on public.notification_settings for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update notification settings" on public.notification_settings;
create policy "Admins can update notification settings"
  on public.notification_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
