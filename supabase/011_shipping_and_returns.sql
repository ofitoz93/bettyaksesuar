-- Kargo takip bilgisi + iade talebi sistemi
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-010'dan sonra).

-- ============ KARGO TAKİP ============

alter table public.orders
  add column if not exists shipping_carrier text,
  add column if not exists tracking_number text;

-- ============ İADE TALEPLERİ ============

create table if not exists public.return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_id uuid references public.profiles(id),
  reason text not null,
  status text not null default 'beklemede'
    check (status in ('beklemede', 'onaylandi', 'reddedildi', 'tamamlandi')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists return_requests_order_idx on public.return_requests (order_id);
create index if not exists return_requests_customer_idx on public.return_requests (customer_id);

alter table public.return_requests enable row level security;

drop policy if exists "Customers can request a return for their own order" on public.return_requests;
create policy "Customers can request a return for their own order"
  on public.return_requests for insert
  to authenticated
  with check (
    customer_id = auth.uid()
    and exists (
      select 1 from public.orders o
      where o.id = order_id and o.customer_id = auth.uid() and o.status = 'teslim_edildi'
    )
  );

drop policy if exists "Customers and admins can read return requests" on public.return_requests;
create policy "Customers and admins can read return requests"
  on public.return_requests for select
  to authenticated
  using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can update return requests" on public.return_requests;
create policy "Admins can update return requests"
  on public.return_requests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
