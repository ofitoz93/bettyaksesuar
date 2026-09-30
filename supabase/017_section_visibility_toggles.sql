-- Ana sayfa bölümlerini admin panelinden aç/kapat yapabilme
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-016'dan sonra).

alter table public.site_settings
  add column if not exists campaign_enabled boolean not null default true,
  add column if not exists engraving_enabled boolean not null default true,
  add column if not exists testimonials_enabled boolean not null default true,
  add column if not exists social_feed_enabled boolean not null default true;
