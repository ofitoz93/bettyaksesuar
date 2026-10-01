import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

export interface NavLink {
  label: string;
  href: string;
}

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  logoUrl: string | null;
  logoHeight: number;
  announcementTexts: string[];
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
  campaignEnabled: boolean;
  engravingImageUrl: string | null;
  engravingEyebrow: string;
  engravingHeading: string;
  engravingBody: string;
  engravingButtonLabel: string;
  engravingEnabled: boolean;
  testimonialsEnabled: boolean;
  socialFeedEnabled: boolean;
  headerPrimaryLinks: NavLink[];
  headerSecondaryLinks: NavLink[];
  footerDescription: string;
  footerHelpLinks: NavLink[];
  footerCompanyLinks: NavLink[];
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "BETTY",
  siteTagline: "AKSESUAR",
  logoUrl: null,
  logoHeight: 56,
  announcementTexts: [
    "1.000 TL ÜZERİ ÜCRETSİZ KARGO",
    "2 YIL GARANTİ",
    "SU GEÇİRMEZ ÇELİK KOLEKSİYON",
  ],
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
  campaignEnabled: true,
  engravingImageUrl: null,
  engravingEyebrow: "EL İŞÇİLİĞİ",
  engravingHeading: "Gravürle Anlam Kat",
  engravingBody:
    "Sevdiklerinize özel bir hediye mi arıyorsunuz? İsim, tarih ya da kısa bir mesajı, seçtiğiniz takının üzerine ustalıkla işleyelim. Her parça, taşıyanı kadar özel.",
  engravingButtonLabel: "Gravür Seçeneklerini Gör",
  engravingEnabled: true,
  testimonialsEnabled: true,
  socialFeedEnabled: true,
  headerPrimaryLinks: [
    { label: "KOLYE", href: "/magaza?kategori=kolye" },
    { label: "KÜPE", href: "/magaza?kategori=kupe" },
    { label: "BİLEKLİK", href: "/magaza?kategori=bileklik" },
    { label: "YÜZÜK", href: "/magaza?kategori=yuzuk" },
  ],
  headerSecondaryLinks: [
    { label: "YENİ GELENLER", href: "/yeni-gelenler" },
    { label: "İNDİRİM", href: "/indirimli-urunler" },
    { label: "TÜM ÜRÜNLER", href: "/magaza" },
  ],
  footerDescription:
    "Su geçirmez, kararmaz çelik takılar. Günlük kullanım için tasarlandı, ömür boyu yanınızda.",
  footerHelpLinks: [
    { label: "Sıkça Sorulan Sorular", href: "/sss" },
    { label: "Kargo & Teslimat", href: "/kargo-teslimat" },
    { label: "Garanti & Bakım", href: "/garanti-bakim" },
    { label: "İade & Değişim", href: "/iade-degisim" },
    { label: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis-sozlesmesi" },
  ],
  footerCompanyLinks: [
    { label: "Hakkımızda", href: "/hakkimizda" },
    { label: "İletişim", href: "/iletisim" },
  ],
};

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = createPublicClient();
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
    logoHeight:
      typeof data.logo_height === "number" && data.logo_height > 0
        ? data.logo_height
        : DEFAULT_SETTINGS.logoHeight,
    announcementTexts:
      Array.isArray(data.announcement_texts) && data.announcement_texts.length > 0
        ? data.announcement_texts
        : DEFAULT_SETTINGS.announcementTexts,
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
    campaignEnabled: data.campaign_enabled,
    engravingImageUrl: data.engraving_image_url,
    engravingEyebrow: data.engraving_eyebrow,
    engravingHeading: data.engraving_heading,
    engravingBody: data.engraving_body,
    engravingButtonLabel: data.engraving_button_label,
    engravingEnabled: data.engraving_enabled,
    testimonialsEnabled: data.testimonials_enabled,
    socialFeedEnabled: data.social_feed_enabled,
    headerPrimaryLinks: data.header_primary_links ?? DEFAULT_SETTINGS.headerPrimaryLinks,
    headerSecondaryLinks: data.header_secondary_links ?? DEFAULT_SETTINGS.headerSecondaryLinks,
    footerDescription: data.footer_description ?? DEFAULT_SETTINGS.footerDescription,
    footerHelpLinks: data.footer_help_links ?? DEFAULT_SETTINGS.footerHelpLinks,
    footerCompanyLinks: data.footer_company_links ?? DEFAULT_SETTINGS.footerCompanyLinks,
  };
});
