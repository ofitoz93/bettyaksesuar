import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

export interface PromoPopupSettings {
  enabled: boolean;
  delaySeconds: number;
  title: string;
  body: string;
  imageUrl: string | null;
  buttonLabel: string;
  discountCode: string;
  discountPercent: number;
}

const DEFAULT_SETTINGS: PromoPopupSettings = {
  enabled: false,
  delaySeconds: 20,
  title: "İlk Üyelikte %10 İndirim",
  body: "Bültenimize katılın, ilk siparişinizde %10 indirim kazanın.",
  imageUrl: null,
  buttonLabel: "Kodu Al",
  discountCode: "HOSGELDIN10",
  discountPercent: 10,
};

export const getPromoPopupSettings = cache(async (): Promise<PromoPopupSettings> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("promo_popup_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_SETTINGS;
  }

  return {
    enabled: data.enabled,
    delaySeconds: data.delay_seconds,
    title: data.title,
    body: data.body,
    imageUrl: data.image_url,
    buttonLabel: data.button_label,
    discountCode: data.discount_code,
    discountPercent: Number(data.discount_percent),
  };
});
