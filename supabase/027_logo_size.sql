-- Admin panelinden ayarlanabilir logo boyutu
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-026'dan sonra).

alter table public.site_settings
  add column if not exists logo_height integer not null default 56;
