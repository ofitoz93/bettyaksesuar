export interface ShippingSettings {
  freeShippingThreshold: number;
  standardShippingFee: number;
}

export function calculateShippingFee(subtotal: number, settings: ShippingSettings): number {
  return subtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee;
}
