-- Kişiye Özel Koleksiyon ve El İşçiliği bölümleri için admin ayarları
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-009'dan sonra).

alter table public.site_settings
  add column if not exists campaign_image_url text,
  add column if not exists campaign_eyebrow text not null default 'KİŞİYE ÖZEL KOLEKSİYON',
  add column if not exists campaign_heading text not null default 'İsminizin İlk Harfiyle,
Sizin İçin Tasarlandı',
  add column if not exists campaign_body text not null default
    'Harf kolyeleri ve gravürlü parçalarla, taşıdığınız her şeyi kendinize özel kılın.',
  add column if not exists campaign_button_label text not null default 'Şimdi Kişiselleştir',
  add column if not exists engraving_image_url text,
  add column if not exists engraving_eyebrow text not null default 'EL İŞÇİLİĞİ',
  add column if not exists engraving_heading text not null default 'Gravürle Anlam Kat',
  add column if not exists engraving_body text not null default
    'Sevdiklerinize özel bir hediye mi arıyorsunuz? İsim, tarih ya da kısa bir mesajı, seçtiğiniz takının üzerine ustalıkla işleyelim. Her parça, taşıyanı kadar özel.',
  add column if not exists engraving_button_label text not null default 'Gravür Seçeneklerini Gör';
