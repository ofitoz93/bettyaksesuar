-- Eklentiler > WhatsApp Sipariş modülü
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-023'ten sonra).

alter table public.store_settings
  add column if not exists whatsapp_enabled boolean not null default false,
  add column if not exists whatsapp_phone text,
  add column if not exists whatsapp_default_message text not null default
    'Merhaba, ürünleriniz hakkında bilgi almak istiyorum.',
  add column if not exists whatsapp_product_message text not null default
    'Merhaba, {urun_adi} adlı ürünle ilgileniyorum: {urun_linki}';
