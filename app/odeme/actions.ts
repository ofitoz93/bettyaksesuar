"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isPaytrConfigured, requestPaytrToken } from "@/lib/paytr";

export interface CheckoutState {
  error?: string;
  order?: {
    id: string;
    orderNumber: string;
    total: number;
    discountAmount: number;
    paymentMethod: string;
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
  const termsAccepted = formData.get("termsAccepted") === "on";

  if (!name || !email || !phone || !address) {
    return { error: "Lütfen ad, e-posta, telefon ve adres alanlarını doldurun." };
  }

  if (
    paymentMethod !== "kapida_odeme" &&
    paymentMethod !== "havale" &&
    paymentMethod !== "kredi_karti"
  ) {
    return { error: "Lütfen bir ödeme yöntemi seçin." };
  }

  if (!termsAccepted) {
    return { error: "Devam etmek için Mesafeli Satış Sözleşmesi'ni onaylamanız gerekir." };
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
    p_terms_accepted: termsAccepted,
  });

  if (error) {
    return { error: error.message || "Sipariş oluşturulamadı, lütfen tekrar deneyin." };
  }

  const order = Array.isArray(data) ? data[0] : data;

  return {
    order: {
      id: order.id,
      orderNumber: order.order_number,
      total: Number(order.total),
      discountAmount: Number(order.discount_amount ?? 0),
      paymentMethod: order.payment_method,
    },
  };
}

export interface PaytrTokenState {
  token?: string;
  error?: string;
}

export async function createPaytrToken(orderId: string): Promise<PaytrTokenState> {
  if (!isPaytrConfigured()) {
    return { error: "Kredi kartı ile ödeme şu anda kullanılamıyor." };
  }

  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, paytr_merchant_oid, payment_method, payment_status, total, guest_name, guest_email, guest_phone, shipping_address, order_items(product_name, unit_price, quantity)",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    return { error: "Sipariş bulunamadı." };
  }

  if (order.payment_method !== "kredi_karti") {
    return { error: "Bu sipariş kredi kartı ile ödeme için oluşturulmamış." };
  }

  if (order.payment_status !== "beklemede") {
    return { error: "Bu sipariş için ödeme zaten işlenmiş." };
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  const headerList = await headers();
  const userIp =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "127.0.0.1";

  const items = (order.order_items ?? []) as {
    product_name: string;
    unit_price: number;
    quantity: number;
  }[];

  const result = await requestPaytrToken({
    merchantOid: order.paytr_merchant_oid,
    email: order.guest_email,
    amountKurus: Math.round(Number(order.total) * 100),
    basket: items.map((item) => ({
      name: item.product_name,
      price: Number(item.unit_price),
      quantity: item.quantity,
    })),
    userIp,
    userName: order.guest_name,
    userAddress: order.shipping_address,
    userPhone: order.guest_phone,
    okUrl: `${siteUrl}/odeme/basarili?oid=${order.paytr_merchant_oid}`,
    failUrl: `${siteUrl}/odeme/basarisiz?oid=${order.paytr_merchant_oid}`,
  });

  return result;
}
