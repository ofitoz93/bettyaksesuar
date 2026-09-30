-- Kargo: parça başına ek ücret + müşterinin kendi siparişini iptal edebilmesi
-- (yalnızca "beklemede" durumundaki siparişler için, stok otomatik geri eklenir).
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-020'den sonra).

alter table public.shipping_settings
  add column if not exists per_item_fee numeric(10, 2) not null default 0;

create or replace function public.cancel_my_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_item record;
begin
  select * into v_order from public.orders where id = p_order_id for update;

  if v_order.id is null then
    raise exception 'Sipariş bulunamadı';
  end if;

  if v_order.customer_id is distinct from auth.uid() then
    raise exception 'Bu sipariş size ait değil';
  end if;

  if v_order.status <> 'beklemede' then
    raise exception 'Bu sipariş artık iptal edilemez, lütfen müşteri hizmetleriyle iletişime geçin';
  end if;

  update public.orders
  set status = 'iptal', payment_status = case when payment_status = 'beklemede' then 'basarisiz' else payment_status end
  where id = p_order_id;

  for v_item in select product_id, quantity from public.order_items where order_id = p_order_id loop
    if v_item.product_id is not null then
      update public.products set stock = stock + v_item.quantity where id = v_item.product_id;
    end if;
  end loop;
end;
$$;

grant execute on function public.cancel_my_order(uuid) to authenticated;
