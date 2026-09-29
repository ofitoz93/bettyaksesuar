-- Stoğa gelince haber ver sistemi
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-011'den sonra).

create table if not exists public.stock_notifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  email text not null,
  customer_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  notified_at timestamptz,
  unique (product_id, email)
);

create index if not exists stock_notifications_product_idx
  on public.stock_notifications (product_id);

create index if not exists stock_notifications_pending_idx
  on public.stock_notifications (product_id)
  where notified_at is null;

alter table public.stock_notifications enable row level security;

drop policy if exists "Anyone can request a stock notification" on public.stock_notifications;
create policy "Anyone can request a stock notification"
  on public.stock_notifications for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Anyone can update their own pending request" on public.stock_notifications;
create policy "Anyone can update their own pending request"
  on public.stock_notifications for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Admins can read stock notifications" on public.stock_notifications;
create policy "Admins can read stock notifications"
  on public.stock_notifications for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can delete stock notifications" on public.stock_notifications;
create policy "Admins can delete stock notifications"
  on public.stock_notifications for delete
  to authenticated
  using (public.is_admin());
