export interface ShippingSettings {
  freeShippingThreshold: number;
  standardShippingFee: number;
  perItemFee: number;
}

export function calculateShippingFee(
  subtotal: number,
  itemCount: number,
  settings: ShippingSettings,
): number {
  if (subtotal >= settings.freeShippingThreshold) return 0;
  return settings.standardShippingFee + settings.perItemFee * Math.max(itemCount - 1, 0);
}
