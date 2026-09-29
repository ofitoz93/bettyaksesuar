"use server";

import { createClient } from "@/lib/supabase/server";

export interface CheckoutState {
  error?: string;
  order?: {
    orderNumber: string;
    total: number;
    discountAmount: number;
  };
}

interface CartItemInput {
  productId: string;
  quantity: number;
}

function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VRS-${stamp}-${rand}`;
}

export async function createOrder(
  _prevState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "");
  const discountCode = String(formData.get("discountCode") ?? "").trim();
  const itemsRaw = String(formData.get("items") ?? "[]");

  if (!name || !email || !phone || !address) {
    return { error: "Lütfen ad, e-posta, telefon ve adres alanlarını doldurun." };
  }

  if (paymentMethod !== "kapida_odeme" && paymentMethod !== "havale") {
    return { error: "Lütfen bir ödeme yöntemi seçin." };
  }

  let items: CartItemInput[];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return { error: "Sepet verisi okunamadı, lütfen sayfayı yenileyip tekrar deneyin." };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Sepetiniz boş." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("create_order", {
    p_order_number: generateOrderNumber(),
    p_customer_id: user?.id ?? null,
    p_guest_name: name,
    p_guest_email: email,
    p_guest_phone: phone,
    p_shipping_address: address,
    p_payment_method: paymentMethod,
    p_items: items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
    p_discount_code: discountCode || null,
  });

  if (error) {
    return { error: error.message || "Sipariş oluşturulamadı, lütfen tekrar deneyin." };
  }

  const order = Array.isArray(data) ? data[0] : data;

  return {
    order: {
      orderNumber: order.order_number,
      total: Number(order.total),
      discountAmount: Number(order.discount_amount ?? 0),
    },
  };
}
