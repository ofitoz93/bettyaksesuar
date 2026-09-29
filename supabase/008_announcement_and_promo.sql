-- Duyuru şeridi metni + ilk ziyaret kampanya popup ayarları
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-007'den sonra).

-- ============ DUYURU ŞERİDİ ============

alter table public.site_settings
  add column if not exists announcement_text text not null default
    '1.000 TL ÜZERİ ÜCRETSİZ KARGO  ·  2 YIL GARANTİ  ·  SU GEÇİRMEZ ÇELİK KOLEKSİYON';

-- ============ İLK ZİYARET KAMPANYA POPUP'I ============

create table if not exists public.promo_popup_settings (
  id int primary key default 1 check (id = 1),
  enabled boolean not null default false,
  delay_seconds int not null default 20,
  title text not null default 'İlk Üyelikte %10 İndirim',
  body text not null default 'Bültenimize katılın, ilk siparişinizde %10 indirim kazanın.',
  image_url text,
  button_label text not null default 'Kodu Al',
  discount_code text not null default 'HOSGELDIN10',
  updated_at timestamptz not null default now()
);

insert into public.promo_popup_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.promo_popup_settings enable row level security;

drop policy if exists "Public can read promo popup settings" on public.promo_popup_settings;
create policy "Public can read promo popup settings"
  on public.promo_popup_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can update promo popup settings" on public.promo_popup_settings;
create policy "Admins can update promo popup settings"
  on public.promo_popup_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
