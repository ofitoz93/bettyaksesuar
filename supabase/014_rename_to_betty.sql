-- Marka adı Verastone -> Betty Aksesuar olarak güncellendi.
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-013'ten sonra).
-- Sadece hâlâ eski varsayılan değerdeyse günceller — admin panelinden elle değiştirdiyseniz dokunmaz.

update public.site_settings
set site_name = 'BETTY', updated_at = now()
where id = 1 and site_name = 'VERASTONE';
