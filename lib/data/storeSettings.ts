import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface StoreSettings {
  storeName: string;
  storeOwner: string | null;
  storeAddress: string | null;
  storeEmail: string | null;
  storePhone: string | null;
  faviconUrl: string | null;
  metaTitle: string;
  metaDescription: string | null;
  metaKeywords: string | null;
  localeCountry: string;
  localeRegion: string | null;
  localeCity: string | null;
  currencyCode: string;
  currencySymbol: string;
  currencyExchangeRate: number;
  currencyUpdatedAt: string | null;
  productsPerPage: number;
  showCategoryProductCount: boolean;
  allowReviews: boolean;
  allowGuestReviews: boolean;
  giftCardsEnabled: boolean;
  maintenanceMode: boolean;
  seoUrlEnabled: boolean;
  sslEnabled: boolean;
  whatsappEnabled: boolean;
  whatsappPhone: string | null;
  whatsappDefaultMessage: string;
  whatsappProductMessage: string;
  xmlFeedEnabled: boolean;
}

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "Betty Aksesuar",
  storeOwner: null,
  storeAddress: null,
  storeEmail: null,
  storePhone: null,
  faviconUrl: null,
  metaTitle: "Betty Aksesuar",
  metaDescription: null,
  metaKeywords: null,
  localeCountry: "Türkiye",
  localeRegion: null,
  localeCity: null,
  currencyCode: "TRY",
  currencySymbol: "₺",
  currencyExchangeRate: 1,
  currencyUpdatedAt: null,
  productsPerPage: 24,
  showCategoryProductCount: true,
  allowReviews: true,
  allowGuestReviews: false,
  giftCardsEnabled: false,
  maintenanceMode: false,
  seoUrlEnabled: true,
  sslEnabled: true,
  whatsappEnabled: false,
  whatsappPhone: null,
  whatsappDefaultMessage: "Merhaba, ürünleriniz hakkında bilgi almak istiyorum.",
  whatsappProductMessage: "Merhaba, {urun_adi} adlı ürünle ilgileniyorum: {urun_linki}",
  xmlFeedEnabled: true,
};

export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_STORE_SETTINGS;
  }

  return {
    storeName: data.store_name,
    storeOwner: data.store_owner,
    storeAddress: data.store_address,
    storeEmail: data.store_email,
    storePhone: data.store_phone,
    faviconUrl: data.favicon_url,
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
    metaKeywords: data.meta_keywords,
    localeCountry: data.locale_country,
    localeRegion: data.locale_region,
    localeCity: data.locale_city,
    currencyCode: data.currency_code,
    currencySymbol: data.currency_symbol,
    currencyExchangeRate: Number(data.currency_exchange_rate),
    currencyUpdatedAt: data.currency_updated_at,
    productsPerPage: data.products_per_page,
    showCategoryProductCount: data.show_category_product_count,
    allowReviews: data.allow_reviews,
    allowGuestReviews: data.allow_guest_reviews,
    giftCardsEnabled: data.gift_cards_enabled,
    maintenanceMode: data.maintenance_mode,
    seoUrlEnabled: data.seo_url_enabled,
    sslEnabled: data.ssl_enabled,
    whatsappEnabled: data.whatsapp_enabled,
    whatsappPhone: data.whatsapp_phone,
    whatsappDefaultMessage: data.whatsapp_default_message,
    whatsappProductMessage: data.whatsapp_product_message,
    xmlFeedEnabled: data.xml_feed_enabled,
  };
});
