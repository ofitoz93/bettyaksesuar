-- Faz 2: kargo ücreti ayarları + sipariş tablosuna kargo ücreti
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001, 002'den sonra).

-- ============ KARGO AYARLARI ============

create table if not exists public.shipping_settings (
  id int primary key default 1 check (id = 1),
  free_shipping_threshold numeric(10, 2) not null default 2000,
  standard_shipping_fee numeric(10, 2) not null default 49.90,
  updated_at timestamptz not null default now()
);

insert into public.shipping_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.shipping_settings enable row level security;

drop policy if exists "Public can read shipping settings" on public.shipping_settings;
create policy "Public can read shipping settings"
  on public.shipping_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can update shipping settings" on public.shipping_settings;
create policy "Admins can update shipping settings"
  on public.shipping_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============ SİPARİŞLERE KARGO ÜCRETİ ============

alter table public.orders
  add column if not exists shipping_fee numeric(10, 2) not null default 0;

-- create_order fonksiyonunu kargo ücreti hesaplayacak şekilde güncelliyoruz
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
  v_shipping public.shipping_settings;
  v_shipping_fee numeric := 0;
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

  select * into v_shipping from public.shipping_settings where id = 1;
  if v_shipping.id is not null and v_subtotal < v_shipping.free_shipping_threshold then
    v_shipping_fee := v_shipping.standard_shipping_fee;
  end if;

  insert into public.orders (
    order_number, customer_id, guest_name, guest_email, guest_phone,
    shipping_address, payment_method, subtotal, shipping_fee, total
  )
  values (
    p_order_number, p_customer_id, p_guest_name, p_guest_email, p_guest_phone,
    p_shipping_address, p_payment_method, v_subtotal, v_shipping_fee, v_subtotal + v_shipping_fee
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
