import { createClient } from "@/lib/supabase/server";

export interface OrderItemRow {
  product_name: string;
  product_slug: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  items: OrderItemRow[];
  shippingCarrier: string | null;
  trackingNumber: string | null;
}

export async function getMyOrders(): Promise<OrderSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(product_name, product_slug, quantity, unit_price, line_total)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyOrders error:", error.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    paymentMethod: row.payment_method,
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shipping_fee ?? 0),
    total: Number(row.total),
    createdAt: row.created_at,
    items: row.order_items,
    shippingCarrier: row.shipping_carrier,
    trackingNumber: row.tracking_number,
  }));
}

export interface AdminOrderSummary extends OrderSummary {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  shippingAddress: string;
}

export async function getAllOrdersForAdmin(): Promise<AdminOrderSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(product_name, product_slug, quantity, unit_price, line_total)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllOrdersForAdmin error:", error.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    paymentMethod: row.payment_method,
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shipping_fee ?? 0),
    total: Number(row.total),
    createdAt: row.created_at,
    items: row.order_items,
    shippingCarrier: row.shipping_carrier,
    trackingNumber: row.tracking_number,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    guestPhone: row.guest_phone,
    shippingAddress: row.shipping_address,
  }));
}
