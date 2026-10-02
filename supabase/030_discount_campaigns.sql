-- Genel kampanya / indirim kodu sistemi: birden fazla kampanya oluşturulabilir,
-- admin panelinde aktif/pasif yapılabilir, düzenlenebilir. Her müşteri her
-- kampanyadan en fazla 1 kez yararlanabilir (sadece ilk sipariş kısıtı kaldırıldı).
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-029'dan sonra).

-- ============ KAMPANYALAR ============

create table if not exists public.discount_campaigns (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  title text not null,
  description text,
  discount_percent numeric(5, 2) not null check (discount_percent > 0 and discount_percent <= 90),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists discount_campaigns_code_key
  on public.discount_campaigns (lower(code));

alter table public.discount_campaigns enable row level security;

drop policy if exists "Admins can manage discount campaigns" on public.discount_campaigns;
create policy "Admins can manage discount campaigns"
  on public.discount_campaigns for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============ KULLANIM KAYITLARI (her müşteri bir kampanyayı en fazla 1 kez kullanabilir) ============

create table if not exists public.discount_campaign_redemptions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.discount_campaigns(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (campaign_id, customer_id)
);

alter table public.discount_campaign_redemptions enable row level security;

drop policy if exists "Admins can read discount redemptions" on public.discount_campaign_redemptions;
create policy "Admins can read discount redemptions"
  on public.discount_campaign_redemptions for select
  to authenticated
  using (public.is_admin());

-- ============ Mevcut "hoşgeldin" kampanya popup kodunu yeni sisteme taşı ============

insert into public.discount_campaigns (code, title, description, discount_percent, enabled)
select
  p.discount_code,
  'Hoşgeldin İndirimi',
  'Kampanya popup''ında gösterilen hoşgeldin kodu.',
  p.discount_percent,
  p.enabled
from public.promo_popup_settings p
where p.id = 1
on conflict (lower(code)) do nothing;

-- ============ Kod doğrulama (ödeme öncesi önizleme için) ============

create or replace function public.validate_discount_code(
  p_code text,
  p_customer_id uuid
)
returns table (ok boolean, discount_percent numeric, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_campaign public.discount_campaigns;
begin
  select * into v_campaign
  from public.discount_campaigns
  where lower(code) = lower(trim(p_code));

  if v_campaign.id is null or not v_campaign.enabled then
    return query select false, null::numeric, 'Geçersiz indirim kodu';
    return;
  end if;

  if p_customer_id is null then
    return query select false, null::numeric,
      'Bu indirim kodu yalnızca üye girişi yapan müşteriler için geçerlidir';
    return;
  end if;

  if exists (
    select 1 from public.discount_campaign_redemptions
    where campaign_id = v_campaign.id and customer_id = p_customer_id
  ) then
    return query select false, null::numeric, 'Bu indirim kodunu daha önce kullandınız';
    return;
  end if;

  return query select true, v_campaign.discount_percent, null::text;
end;
$$;

grant execute on function public.validate_discount_code(text, uuid) to anon, authenticated;

-- ============ create_order: indirim kodunu yeni kampanya sistemine bağla ============

drop function if exists public.create_order(
  text, uuid, text, text, text, text, text, jsonb, text, boolean, text, text, text, text
);

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
begin
  if not p_terms_accepted then
    raise exception 'Mesafeli Satış Sözleşmesi onaylanmadan sipariş oluşturulamaz';
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'Sepet boş';
  end if;

  select * into v_payment_method from public.payment_methods where code = p_payment_method;
  if v_payment_method.code is null or not v_payment_method.enabled then
    raise exception 'Seçilen ödeme yöntemi şu anda kullanılamıyor';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
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

    if p_customer_id is null then
      raise exception 'Bu indirim kodu yalnızca üye girişi yapan müşteriler için geçerlidir';
    end if;

    if exists (
      select 1 from public.discount_campaign_redemptions
      where campaign_id = v_campaign.id and customer_id = p_customer_id
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
    p_order_number, p_customer_id, p_guest_name, p_guest_email, p_guest_phone,
    p_shipping_address, p_city, p_district, p_neighbourhood, p_billing_address,
    p_payment_method, v_subtotal, v_shipping_fee,
    nullif(trim(coalesce(p_discount_code, '')), ''), v_discount_amount,
    v_payment_method.extra_discount_percent, v_payment_discount_amount,
    v_subtotal + v_shipping_fee - v_discount_amount - v_payment_discount_amount,
    v_merchant_oid, now()
  )
  returning * into v_order;

  if v_campaign.id is not null then
    insert into public.discount_campaign_redemptions (campaign_id, customer_id, order_id)
    values (v_campaign.id, p_customer_id, v_order.id);
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
    );

    update public.products set stock = stock - v_quantity where id = v_product.id;
  end loop;

  return v_order;
end;
$$;

grant execute on function public.create_order(
  text, uuid, text, text, text, text, text, jsonb, text, boolean, text, text, text, text
) to anon, authenticated;
