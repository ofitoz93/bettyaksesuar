import { createPublicClient } from "@/lib/supabase/public";
import type { ShippingSettings } from "@/lib/shipping";

const DEFAULT_SETTINGS: ShippingSettings = {
  freeShippingThreshold: 2000,
  standardShippingFee: 49.9,
  perItemFee: 0,
};

export async function getShippingSettings(): Promise<ShippingSettings> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("shipping_settings")
    .select("free_shipping_threshold, standard_shipping_fee, per_item_fee")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_SETTINGS;
  }

  return {
    freeShippingThreshold: Number(data.free_shipping_threshold),
    standardShippingFee: Number(data.standard_shipping_fee),
    perItemFee: Number(data.per_item_fee),
  };
}
