-- İlk alışveriş indirim kodu desteği (sadece üye olan, ilk siparişini veren müşteriler için)
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-008'den sonra).

alter table public.promo_popup_settings
  add column if not exists discount_percent numeric(5, 2) not null default 10;

alter table public.orders
  add column if not exists discount_code text,
  add column if not exists discount_amount numeric(10, 2) not null default 0;

drop function if exists public.create_order(text, uuid, text, text, text, text, text, jsonb);

create or replace function public.create_order(
  p_order_number text,
  p_customer_id uuid,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_shipping_address text,
  p_payment_method text,
  p_items jsonb,
  p_discount_code text default null
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
  v_promo public.promo_popup_settings;
  v_discount_amount numeric := 0;
  v_prior_orders int;
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
      raise exception 'Ürün bulunamadı (sepetinizdeki bir ürün artık mevcut değil). Lütfen sepetinizi güncelleyip tekrar deneyin.';
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

  if p_discount_code is not null and length(trim(p_discount_code)) > 0 then
    select * into v_promo from public.promo_popup_settings where id = 1;

    if v_promo.id is null or not v_promo.enabled
       or lower(trim(v_promo.discount_code)) <> lower(trim(p_discount_code)) then
      raise exception 'Geçersiz indirim kodu';
    end if;

    if p_customer_id is null then
      raise exception 'Bu indirim kodu yalnızca üye girişi yapan müşteriler için geçerlidir';
    end if;

    select count(*) into v_prior_orders from public.orders where customer_id = p_customer_id;
    if v_prior_orders > 0 then
      raise exception 'Bu indirim kodu yalnızca ilk siparişinizde geçerlidir';
    end if;

    v_discount_amount := round(v_subtotal * v_promo.discount_percent / 100, 2);
  end if;

  insert into public.orders (
    order_number, customer_id, guest_name, guest_email, guest_phone,
    shipping_address, payment_method, subtotal, shipping_fee,
    discount_code, discount_amount, total
  )
  values (
    p_order_number, p_customer_id, p_guest_name, p_guest_email, p_guest_phone,
    p_shipping_address, p_payment_method, v_subtotal, v_shipping_fee,
    nullif(trim(coalesce(p_discount_code, '')), ''), v_discount_amount,
    v_subtotal + v_shipping_fee - v_discount_amount
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

grant execute on function public.create_order(text, uuid, text, text, text, text, text, jsonb, text) to anon, authenticated;
