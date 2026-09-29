-- Faz 1: profiller/roller, çoklu ürün görseli, sipariş sistemi
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (schema.sql'den sonra).

-- ============ PROFİLLER & ROLLER ============

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mevcut kullanıcılar için profil satırı yoksa oluştur (ör. daha önce panelden eklenen admin)
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer set search_path = public;

-- products yazma yetkisini admin'e daraltıyoruz (Faz 2'de müşteri hesapları geldiğinde
-- "authenticated = herkes yazabilir" artık güvenli değil)
drop policy if exists "Authenticated can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Authenticated can update products" on public.products;
create policy "Admins can update products"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Authenticated can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "Authenticated can upload product images" on storage.objects;
create policy "Admins can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Authenticated can update product images" on storage.objects;
create policy "Admins can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Authenticated can delete product images" on storage.objects;
create policy "Admins can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ============ ÜRÜN GÖRSEL GALERİSİ ============

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_idx on public.product_images (product_id, position);

alter table public.product_images enable row level security;

drop policy if exists "Public can read product images" on public.product_images;
create policy "Public can read product images"
  on public.product_images for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can write product images" on public.product_images;
create policy "Admins can write product images"
  on public.product_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Mevcut products.image_url değerlerini galeriye taşı (bir kere çalışır, tekrar eklemez)
insert into public.product_images (product_id, url, position)
select p.id, p.image_url, 0
from public.products p
where p.image_url is not null
  and not exists (
    select 1 from public.product_images pi where pi.product_id = p.id
  );

-- ============ SİPARİŞLER ============

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid references public.profiles(id),
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  shipping_address text not null,
  payment_method text not null check (payment_method in ('kapida_odeme', 'havale')),
  status text not null default 'beklemede'
    check (status in ('beklemede', 'onaylandi', 'kargoda', 'teslim_edildi', 'iptal')),
  subtotal numeric(10, 2) not null,
  total numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  product_slug text not null,
  unit_price numeric(10, 2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(10, 2) not null
);

create index if not exists orders_customer_idx on public.orders (customer_id);
create index if not exists order_items_order_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Anyone can place an order" on public.orders;
create policy "Anyone can place an order"
  on public.orders for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Customers and admins can read orders" on public.orders;
create policy "Customers and admins can read orders"
  on public.orders for select
  to authenticated
  using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Anyone can insert order items" on public.order_items;
create policy "Anyone can insert order items"
  on public.order_items for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Customers and admins can read order items" on public.order_items;
create policy "Customers and admins can read order items"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.customer_id = auth.uid() or public.is_admin())
    )
  );

-- Siparişi ve kalemlerini tek işlemde (stok kontrolü + düşme dahil) oluşturan fonksiyon
create or replace function public.create_order(
  p_order_number text,
  p_customer_id uuid,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_shipping_address text,
  p_payment_method text,
  p_items jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_item jsonb;
  v_product public.products;
  v_quantity int;
  v_subtotal numeric := 0;
  v_line_total numeric;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Sepet boş';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product
    from public.products
    where id = (v_item->>'product_id')::uuid
    for update;

    if v_product.id is null then
      raise exception 'Ürün bulunamadı';
    end if;

    v_quantity := (v_item->>'quantity')::int;

    if v_product.stock < v_quantity then
      raise exception '"%" için yeterli stok yok (stokta % adet var)', v_product.name, v_product.stock;
    end if;

    v_subtotal := v_subtotal + v_product.price * v_quantity;
  end loop;

  insert into public.orders (
    order_number, customer_id, guest_name, guest_email, guest_phone,
    shipping_address, payment_method, subtotal, total
  )
  values (
    p_order_number, p_customer_id, p_guest_name, p_guest_email, p_guest_phone,
    p_shipping_address, p_payment_method, v_subtotal, v_subtotal
  )
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product from public.products where id = (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::int;
    v_line_total := v_product.price * v_quantity;

    insert into public.order_items (
      order_id, product_id, product_name, product_slug, unit_price, quantity, line_total
    )
    values (
      v_order.id, v_product.id, v_product.name, v_product.slug, v_product.price, v_quantity, v_line_total
    );

    update public.products set stock = stock - v_quantity where id = v_product.id;
  end loop;

  return v_order;
end;
$$;

grant execute on function public.create_order(text, uuid, text, text, text, text, text, jsonb) to anon, authenticated;
