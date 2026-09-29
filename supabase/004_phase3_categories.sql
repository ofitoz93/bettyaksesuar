-- Faz 3: kategori listesini genişletme
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001, 002, 003'ten sonra).

alter table public.products drop constraint if exists products_category_check;
alter table public.products add constraint products_category_check
  check (category in (
    'kolye', 'boncuk-kolye', 'kupe', 'bileklik', 'kelepce',
    'yuzuk', 'set', 'saat', 'sahmeran', 'halhal'
  ));
