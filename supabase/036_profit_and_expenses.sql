-- KÂR-ZARAR: alış fiyatları, sipariş anı maliyet kaydı ve gider defteri.
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-035'ten sonra).
--
-- 1) product_costs: ürün alış fiyatları artık ayrı, yalnızca admin'in okuyabildiği bir
--    tabloda. products tablosu herkese açık okunduğu için products.cost_price alanı
--    alış fiyatlarını ziyaretçilere de açıyordu (alan 037'de kaldırılır).
-- 2) order_item_costs: create_order() her satırın o anki alış fiyatını kaydeder; alış
--    fiyatı sonradan değişse de geçmiş satışların kârı değişmez. Ayrı tabloda tutulur
--    çünkü order_items'ı siparişi veren müşteri de okuyabiliyor.
-- 3) expenses: kargo, reklam, paketleme, komisyon vb. giderler (yalnızca admin).

-- ============ 1) Alış fiyatları ============
create table if not exists public.product_costs (
  product_id uuid primary key references public.products(id) on delete cascade,
  cost_price numeric(10,2) not null check (cost_price >= 0),
  updated_at timestamptz not null default now()
);

alter table public.product_costs enable row level security;

drop policy if exists "Admins manage product costs" on public.product_costs;
create policy "Admins manage product costs"
  on public.product_costs for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.product_costs (product_id, cost_price)
select id, cost_price from public.products where cost_price is not null
on conflict (product_id) do nothing;

-- ============ 2) Sipariş satırı maliyetleri ============
create table if not exists public.order_item_costs (
  order_item_id uuid primary key references public.order_items(id) on delete cascade,
  unit_cost numeric(10,2) not null check (unit_cost >= 0)
);

alter table public.order_item_costs enable row level security;

drop policy if exists "Admins manage order item costs" on public.order_item_costs;
create policy "Admins manage order item costs"
  on public.order_item_costs for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Mevcut sipariş satırları için bugünkü alış fiyatı kaydedilir (varsa)
insert into public.order_item_costs (order_item_id, unit_cost)
select oi.id, pc.cost_price
from public.order_items oi
join public.product_costs pc on pc.product_id = oi.product_id
on conflict (order_item_id) do nothing;

-- ============ 3) Giderler ============
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null default current_date,
  category text not null
    check (category in ('kargo', 'reklam', 'paketleme', 'komisyon', 'kira', 'personel', 'vergi', 'diger')),
  amount numeric(12,2) not null check (amount > 0),
  description text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists expenses_date_idx on public.expenses (expense_date);

alter table public.expenses enable row level security;

drop policy if exists "Admins manage expenses" on public.expenses;
create policy "Admins manage expenses"
  on public.expenses for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============ 4) create_order: satır maliyetini kaydet ============
create or replace function public.create_order(
  p_order_number text,
  p_customer_id uuid,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_shipping_address text,
  p_payment_method text,
  p_items jsonb,
  p_discount_code text default null,
  p_terms_accepted boolean default false,
  p_city text default null,
  p_district text default null,
  p_neighbourhood text default null,
  p_billing_address text default null
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
  v_total_qty int := 0;
  v_subtotal numeric := 0;
  v_line_total numeric;
  v_shipping public.shipping_settings;
  v_shipping_fee numeric := 0;
  v_campaign public.discount_campaigns;
  v_discount_amount numeric := 0;
  v_merchant_oid text;
  v_payment_method public.payment_methods;
  v_payment_discount_amount numeric := 0;
  v_customer_id uuid := auth.uid();
  v_order_item_id uuid;
begin
  -- p_customer_id geriye dönük uyumluluk için imzada duruyor ama kullanılmıyor:
  -- müşteri her zaman oturumdaki kullanıcıdır (misafirde null).

  if not p_terms_accepted then
    raise exception 'Mesafeli Satış Sözleşmesi onaylanmadan sipariş oluşturulamaz';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Sepet boş';
  end if;

  if jsonb_array_length(p_items) > 100 then
    raise exception 'Sepette çok fazla ürün var';
  end if;

  select * into v_payment_method from public.payment_methods where code = p_payment_method;
  if v_payment_method.code is null or not v_payment_method.enabled then
    raise exception 'Seçilen ödeme yöntemi şu anda kullanılamıyor';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    if coalesce(v_item->>'quantity', '') !~ '^[0-9]{1,3}$' or (v_item->>'quantity')::int < 1 then
      raise exception 'Geçersiz ürün adedi';
    end if;

    select * into v_product
    from public.products
    where id = (v_item->>'product_id')::uuid
    for update;

    if v_product.id is null then
      raise exception 'Ürün bulunamadı (sepetinizdeki bir ürün artık mevcut değil). Lütfen sepetinizi güncelleyip tekrar deneyin.';
    end if;

    v_quantity := (v_item->>'quantity')::int;

    if v_product.stock < v_quantity then
      raise exception '"%" için yeterli stok yok (stokta % adet var)', v_product.name, v_product.stock;
    end if;

    v_subtotal := v_subtotal + v_product.price * v_quantity;
    v_total_qty := v_total_qty + v_quantity;
  end loop;

  select * into v_shipping from public.shipping_settings where id = 1;
  if v_shipping.id is not null and v_subtotal < v_shipping.free_shipping_threshold then
    v_shipping_fee := v_shipping.standard_shipping_fee
      + coalesce(v_shipping.per_item_fee, 0) * greatest(v_total_qty - 1, 0);
  end if;

  if p_discount_code is not null and length(trim(p_discount_code)) > 0 then
    select * into v_campaign
    from public.discount_campaigns
    where lower(code) = lower(trim(p_discount_code));

    if v_campaign.id is null or not v_campaign.enabled then
      raise exception 'Geçersiz indirim kodu';
    end if;

    if v_customer_id is null then
      raise exception 'Bu indirim kodu yalnızca üye girişi yapan müşteriler için geçerlidir';
    end if;

    if exists (
      select 1 from public.discount_campaign_redemptions
      where campaign_id = v_campaign.id and customer_id = v_customer_id
    ) then
      raise exception 'Bu indirim kodunu daha önce kullandınız';
    end if;

    v_discount_amount := round(v_subtotal * v_campaign.discount_percent / 100, 2);
  end if;

  if v_payment_method.extra_discount_percent > 0 then
    v_payment_discount_amount := round(v_subtotal * v_payment_method.extra_discount_percent / 100, 2);
  end if;

  -- PayTR merchant_oid yalnızca harf/rakam kabul eder — sipariş numarasındaki
  -- tireler ayıklanarak üretilir (örn. VRS-1A2B-C3D4 -> VRS1A2BC3D4).
  v_merchant_oid := regexp_replace(p_order_number, '[^A-Za-z0-9]', '', 'g');

  insert into public.orders (
    order_number, customer_id, guest_name, guest_email, guest_phone,
    shipping_address, city, district, neighbourhood, billing_address,
    payment_method, subtotal, shipping_fee,
    discount_code, discount_amount, payment_discount_percent, payment_discount_amount,
    total, paytr_merchant_oid, terms_accepted_at
  )
  values (
    p_order_number, v_customer_id, p_guest_name, p_guest_email, p_guest_phone,
    p_shipping_address, p_city, p_district, p_neighbourhood, p_billing_address,
    p_payment_method, v_subtotal, v_shipping_fee,
    nullif(trim(coalesce(p_discount_code, '')), ''), v_discount_amount,
    v_payment_method.extra_discount_percent, v_payment_discount_amount,
    greatest(v_subtotal + v_shipping_fee - v_discount_amount - v_payment_discount_amount, 0),
    v_merchant_oid, now()
  )
  returning * into v_order;

  if v_campaign.id is not null then
    insert into public.discount_campaign_redemptions (campaign_id, customer_id, order_id)
    values (v_campaign.id, v_customer_id, v_order.id);
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product from public.products where id = (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::int;
    v_line_total := v_product.price * v_quantity;

    insert into public.order_items (
      order_id, product_id, product_name, product_slug, unit_price, quantity, line_total
    )
    values (
      v_order.id, v_product.id, v_product.name, v_product.slug, v_product.price, v_quantity, v_line_total
    )
    returning id into v_order_item_id;

    -- Satış anındaki alış fiyatı (girilmişse) kâr hesabı için saklanır
    insert into public.order_item_costs (order_item_id, unit_cost)
    select v_order_item_id, pc.cost_price
    from public.product_costs pc
    where pc.product_id = v_product.id;

    -- Aynı ürün birden fazla satırda olsa bile stok eksiye düşmesin
    update public.products set stock = stock - v_quantity
    where id = v_product.id and stock >= v_quantity;
    if not found then
      raise exception '"%" için yeterli stok yok', v_product.name;
    end if;
  end loop;

  return v_order;
end;
$$;
