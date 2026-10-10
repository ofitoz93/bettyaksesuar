-- Hesabım paneli (adres defteri) + admin sipariş detayı (notlar / zaman çizelgesi)
-- + GÜVENLİK: müşterinin kendi profilindeki "role" alanını "admin" yapabilmesi engellendi.
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-031'den sonra).

-- ============ GÜVENLİK: rol yükseltmeyi engelle ============
-- "Users can update own profile" politikası tüm sütunlara izin veriyordu; giriş
-- yapmış bir müşteri tarayıcıdan profiles.role = 'admin' yazabiliyordu.

create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and coalesce(auth.role(), '') <> 'service_role'
     and not public.is_admin() then
    raise exception 'Rol değiştirme yetkiniz yok';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_change on public.profiles;
create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- ============ ADRES DEFTERİ ============

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  full_name text not null,
  phone text not null,
  city text not null,
  district text not null,
  neighbourhood text not null,
  address_line text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_addresses_customer_idx
  on public.customer_addresses (customer_id);

-- Her müşterinin en fazla 1 varsayılan adresi olabilir
create unique index if not exists customer_addresses_one_default
  on public.customer_addresses (customer_id) where is_default;

alter table public.customer_addresses enable row level security;

drop policy if exists "Customers manage own addresses" on public.customer_addresses;
create policy "Customers manage own addresses"
  on public.customer_addresses for all
  to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

drop policy if exists "Admins can read addresses" on public.customer_addresses;
create policy "Admins can read addresses"
  on public.customer_addresses for select
  to authenticated
  using (public.is_admin());

-- Bir adresi varsayılan yapar, diğerlerinin işaretini kaldırır (tek işlemde)
create or replace function public.set_default_address(p_address_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.customer_addresses
  set is_default = false
  where customer_id = auth.uid() and is_default and id <> p_address_id;

  update public.customer_addresses
  set is_default = true, updated_at = now()
  where id = p_address_id and customer_id = auth.uid();
end;
$$;

grant execute on function public.set_default_address(uuid) to authenticated;

-- ============ SİPARİŞ ZAMAN ÇİZELGESİ (durum değişiklikleri + admin notları) ============

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  -- 'created' | 'status' | 'payment' | 'tracking' | 'note'
  kind text not null,
  from_value text,
  to_value text,
  -- Not metni ('note') ya da kargo bilgisi ('tracking')
  message text,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists order_events_order_idx on public.order_events (order_id, created_at);

alter table public.order_events enable row level security;

drop policy if exists "Admins manage order events" on public.order_events;
create policy "Admins manage order events"
  on public.order_events for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Sipariş oluşturulduğunda, durum / ödeme / kargo bilgisi değiştiğinde otomatik kayıt düşer
create or replace function public.log_order_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_events (order_id, kind)
    values (new.id, 'created');
    return new;
  end if;

  if new.status is distinct from old.status then
    insert into public.order_events (order_id, kind, from_value, to_value, author_id)
    values (new.id, 'status', old.status, new.status, auth.uid());
  end if;

  if new.payment_status is distinct from old.payment_status then
    insert into public.order_events (order_id, kind, from_value, to_value, author_id)
    values (new.id, 'payment', old.payment_status, new.payment_status, auth.uid());
  end if;

  if new.tracking_number is distinct from old.tracking_number and new.tracking_number is not null then
    insert into public.order_events (order_id, kind, message, author_id)
    values (new.id, 'tracking', coalesce(new.shipping_carrier, '—') || ' / ' || new.tracking_number, auth.uid());
  end if;

  return new;
end;
$$;

drop trigger if exists orders_log_event on public.orders;
create trigger orders_log_event
  after insert or update on public.orders
  for each row execute function public.log_order_event();

-- Mevcut siparişler için "oluşturuldu" kaydı (bir kere çalışır)
insert into public.order_events (order_id, kind, created_at)
select o.id, 'created', o.created_at
from public.orders o
where not exists (
  select 1 from public.order_events e where e.order_id = o.id and e.kind = 'created'
);
