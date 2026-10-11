-- 036 ile alış fiyatları product_costs tablosuna taşındı. Herkese açık products
-- tablosundaki eski alan kaldırılır (uygulamanın yeni sürümü yayına alındıktan sonra çalıştırın).
insert into public.product_costs (product_id, cost_price)
select id, cost_price from public.products where cost_price is not null
on conflict (product_id) do nothing;

alter table public.products drop column if exists cost_price;
