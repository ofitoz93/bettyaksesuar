-- GÜVENLİK: Toptancı havuzu (tablolar + "wholesale-images" deposu) yalnızca admin'e açık.
-- Önceden "giriş yapmış herkes" okuyup yazabiliyordu; siteye üye olan herhangi bir
-- müşteri toptancı ürünlerini görebilir, ekleyebilir ve silebilirdi.
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-032'den sonra).

-- ============ wholesale_products ============
drop policy if exists "Authenticated can read wholesale products" on public.wholesale_products;
drop policy if exists "Authenticated can insert wholesale products" on public.wholesale_products;
drop policy if exists "Authenticated can delete wholesale products" on public.wholesale_products;
drop policy if exists "Admins manage wholesale products" on public.wholesale_products;
create policy "Admins manage wholesale products"
  on public.wholesale_products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============ wholesale_product_images ============
drop policy if exists "Authenticated can read wholesale product images" on public.wholesale_product_images;
drop policy if exists "Authenticated can insert wholesale product images" on public.wholesale_product_images;
drop policy if exists "Authenticated can delete wholesale product images" on public.wholesale_product_images;
drop policy if exists "Admins manage wholesale product images" on public.wholesale_product_images;
create policy "Admins manage wholesale product images"
  on public.wholesale_product_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============ storage: wholesale-images ============
drop policy if exists "Authenticated can view wholesale images" on storage.objects;
drop policy if exists "Authenticated can upload wholesale images" on storage.objects;
drop policy if exists "Authenticated can delete wholesale images" on storage.objects;

drop policy if exists "Admins can view wholesale images" on storage.objects;
create policy "Admins can view wholesale images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'wholesale-images' and public.is_admin());

drop policy if exists "Admins can upload wholesale images" on storage.objects;
create policy "Admins can upload wholesale images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'wholesale-images' and public.is_admin());

drop policy if exists "Admins can delete wholesale images" on storage.objects;
create policy "Admins can delete wholesale images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'wholesale-images' and public.is_admin());
