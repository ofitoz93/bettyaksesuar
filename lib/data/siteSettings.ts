import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  logoUrl: string | null;
  announcementText: string;
  heroEyebrow: string;
  heroHeading: string;
  heroSubtitle: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  pinterestUrl: string | null;
  campaignImageUrl: string | null;
  campaignEyebrow: string;
  campaignHeading: string;
  campaignBody: string;
  campaignButtonLabel: string;
  engravingImageUrl: string | null;
  engravingEyebrow: string;
  engravingHeading: string;
  engravingBody: string;
  engravingButtonLabel: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "VERASTONE",
  siteTagline: "AKSESUAR",
  logoUrl: null,
  announcementText:
    "1.000 TL ÜZERİ ÜCRETSİZ KARGO  ·  2 YIL GARANTİ  ·  SU GEÇİRMEZ ÇELİK KOLEKSİYON",
  heroEyebrow: "2026 SONBAHAR KOLEKSİYONU",
  heroHeading: "Zarafetin\nYeni Adı",
  heroSubtitle:
    "Su geçirmez, kararmaz, 18 ayar altın kaplama. Günlük kullanım için tasarlanan, ömür boyu yanınızda olan takılar.",
  heroPrimaryLabel: "Koleksiyonu Keşfet",
  heroPrimaryHref: "/magaza",
  heroSecondaryLabel: "Çok Satanlar",
  heroSecondaryHref: "/cok-satanlar",
  instagramUrl: null,
  facebookUrl: null,
  pinterestUrl: null,
  campaignImageUrl: null,
  campaignEyebrow: "KİŞİYE ÖZEL KOLEKSİYON",
  campaignHeading: "İsminizin İlk Harfiyle,\nSizin İçin Tasarlandı",
  campaignBody: "Harf kolyeleri ve gravürlü parçalarla, taşıdığınız her şeyi kendinize özel kılın.",
  campaignButtonLabel: "Şimdi Kişiselleştir",
  engravingImageUrl: null,
  engravingEyebrow: "EL İŞÇİLİĞİ",
  engravingHeading: "Gravürle Anlam Kat",
  engravingBody:
    "Sevdiklerinize özel bir hediye mi arıyorsunuz? İsim, tarih ya da kısa bir mesajı, seçtiğiniz takının üzerine ustalıkla işleyelim. Her parça, taşıyanı kadar özel.",
  engravingButtonLabel: "Gravür Seçeneklerini Gör",
};

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_SETTINGS;
  }

  return {
    siteName: data.site_name,
    siteTagline: data.site_tagline,
    logoUrl: data.logo_url,
    announcementText: data.announcement_text,
    heroEyebrow: data.hero_eyebrow,
    heroHeading: data.hero_heading,
    heroSubtitle: data.hero_subtitle,
    heroPrimaryLabel: data.hero_primary_label,
    heroPrimaryHref: data.hero_primary_href,
    heroSecondaryLabel: data.hero_secondary_label,
    heroSecondaryHref: data.hero_secondary_href,
    instagramUrl: data.instagram_url,
    facebookUrl: data.facebook_url,
    pinterestUrl: data.pinterest_url,
    campaignImageUrl: data.campaign_image_url,
    campaignEyebrow: data.campaign_eyebrow,
    campaignHeading: data.campaign_heading,
    campaignBody: data.campaign_body,
    campaignButtonLabel: data.campaign_button_label,
    engravingImageUrl: data.engraving_image_url,
    engravingEyebrow: data.engraving_eyebrow,
    engravingHeading: data.engraving_heading,
    engravingBody: data.engraving_body,
    engravingButtonLabel: data.engraving_button_label,
  };
});
