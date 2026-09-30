import { createClient } from "@/lib/supabase/server";

export interface PaymentMethod {
  code: string;
  label: string;
  enabled: boolean;
  extraDiscountPercent: number;
  sortOrder: number;
}

export async function getAllPaymentMethods(): Promise<PaymentMethod[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    code: row.code,
    label: row.label,
    enabled: row.enabled,
    extraDiscountPercent: Number(row.extra_discount_percent),
    sortOrder: row.sort_order,
  }));
}

export async function getEnabledPaymentMethods(): Promise<PaymentMethod[]> {
  const methods = await getAllPaymentMethods();
  return methods.filter((m) => m.enabled);
}
