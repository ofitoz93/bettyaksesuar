-- Admin uygulaması: push bildirimi abonelikleri (her cihaz/tarayıcı bir satır).
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-034'ten sonra).
--
-- Bildirimler sunucudan service_role ile gönderilir (müşteri sipariş verdiğinde de
-- tetiklendiği için); admin yalnızca kendi cihazlarını görür / yönetir.

create table if not exists public.admin_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  device_name text,
  -- Hangi olaylarda bildirim gelsin (cihaz başına)
  notify_new_order boolean not null default true,
  notify_order_cancelled boolean not null default true,
  notify_return_request boolean not null default true,
  notify_stock_request boolean not null default true,
  notify_low_stock boolean not null default true,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create index if not exists admin_push_subscriptions_user_idx
  on public.admin_push_subscriptions (user_id);

alter table public.admin_push_subscriptions enable row level security;

drop policy if exists "Admins manage own push subscriptions" on public.admin_push_subscriptions;
create policy "Admins manage own push subscriptions"
  on public.admin_push_subscriptions for all
  to authenticated
  using (user_id = auth.uid() and public.is_admin())
  with check (user_id = auth.uid() and public.is_admin());
