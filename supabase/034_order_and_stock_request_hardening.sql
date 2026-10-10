-- GÜVENLİK: sipariş oluşturma + stok talebi sıkılaştırması.
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-033'ten sonra).
--
-- 1) orders / order_items tablolarına doğrudan INSERT kapatıldı. Siparişler yalnızca
--    create_order() fonksiyonuyla (fiyatları veritabanından kendisi hesaplar) oluşur;
--    doğrudan yazma izni elle fiyat girilmiş sahte siparişe kapı açıyordu.
-- 2) create_order(): adet 1-999 arası tam sayı olmalı (negatif adetle toplam düşürülüp
--    stok artırılabiliyordu) ve müşteri kimliği istemciden değil oturumdan (auth.uid())
--    alınır (başkası adına sipariş / indirim kodu kullanımı engellendi). Aynı ürün
--    sepette birden fazla satırda olsa bile stok eksiye düşemez.
-- 3) stock_notifications: herkese açık UPDATE kaldırıldı (herkes başkasının talebini
--    değiştirebiliyordu). Talepler request_stock_notification() ile kaydedilir;
--    "bildirildi" işaretlemesi yalnızca admin'e açık.

-- ============ 1) Doğrudan sipariş yazma kapalı ============
drop policy if exists "Anyone can place an order" on public.orders;
drop policy if exists "Anyone can insert order items" on public.order_items;

-- ============ 2) create_order sıkılaştırması ============
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
    );

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

-- ============ 3) Stok talepleri ============
drop policy if exists "Anyone can update their own pending request" on public.stock_notifications;
drop policy if exists "Anyone can request a stock notification" on public.stock_notifications;

drop policy if exists "Admins can update stock notifications" on public.stock_notifications;
create policy "Admins can update stock notifications"
  on public.stock_notifications for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Talep kaydı / yenileme: aynı ürün + e-posta için tekrar istenirse talep yeniden açılır.
-- Başka hiçbir alan dışarıdan değiştirilemez; müşteri kimliği oturumdan alınır.
create or replace function public.request_stock_notification(p_product_id uuid, p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 254 then
    raise exception 'Geçersiz e-posta adresi';
  end if;

  if not exists (select 1 from public.products where id = p_product_id) then
    raise exception 'Ürün bulunamadı';
  end if;

  insert into public.stock_notifications (product_id, email, customer_id, notified_at)
  values (p_product_id, v_email, auth.uid(), null)
  on conflict (product_id, email) do update
    set notified_at = null,
        customer_id = coalesce(excluded.customer_id, public.stock_notifications.customer_id);
end;
$$;

revoke all on function public.request_stock_notification(uuid, text) from public;
grant execute on function public.request_stock_notification(uuid, text) to anon, authenticated;
