-- Kampanya popup'ındaki indirim yüzdesi artık discount_campaigns tablosundan
-- yönetiliyor (030_discount_campaigns.sql). Bu sütun kullanılmıyor.
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-030'dan sonra).

alter table public.promo_popup_settings drop column if exists discount_percent;
