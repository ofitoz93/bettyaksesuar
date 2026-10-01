-- Favoriler (istek listesi) + duyuru şeridinde çoklu mesaj (carousel)
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-025'ten sonra).

-- ============ FAVORİLER ============

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists favorites_user_idx on public.favorites (user_id);

alter table public.favorites enable row level security;

drop policy if exists "Users can view their own favorites" on public.favorites;
create policy "Users can view their own favorites"
  on public.favorites for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can add their own favorites" on public.favorites;
create policy "Users can add their own favorites"
  on public.favorites for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove their own favorites" on public.favorites;
create policy "Users can remove their own favorites"
  on public.favorites for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============ DUYURU ŞERİDİ: ÇOKLU MESAJ ============

alter table public.site_settings
  add column if not exists announcement_texts jsonb not null default
    '["1.000 TL ÜZERİ ÜCRETSİZ KARGO","2 YIL GARANTİ","SU GEÇİRMEZ ÇELİK KOLEKSİYON"]'::jsonb;

update public.site_settings
set announcement_texts = to_jsonb(string_to_array(announcement_text, ' · '))
where announcement_text is not null and announcement_text <> '';

alter table public.site_settings drop column if exists announcement_text;
