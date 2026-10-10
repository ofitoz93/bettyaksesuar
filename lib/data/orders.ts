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
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  items: OrderItemRow[];
  shippingCarrier: string | null;
  trackingNumber: string | null;
}

export interface OrderDetail extends OrderSummary {
  customerId: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  shippingAddress: string;
  city: string | null;
  district: string | null;
  neighbourhood: string | null;
  billingAddress: string | null;
  discountCode: string | null;
  discountAmount: number;
  paymentDiscountPercent: number;
  paymentDiscountAmount: number;
}

const ORDER_SELECT =
  "*, order_items(product_name, product_slug, quantity, unit_price, line_total)";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrder(row: any): OrderDetail {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shipping_fee ?? 0),
    total: Number(row.total),
    createdAt: row.created_at,
    items: row.order_items ?? [],
    shippingCarrier: row.shipping_carrier,
    trackingNumber: row.tracking_number,
    customerId: row.customer_id,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    guestPhone: row.guest_phone,
    shippingAddress: row.shipping_address,
    city: row.city ?? null,
    district: row.district ?? null,
    neighbourhood: row.neighbourhood ?? null,
    billingAddress: row.billing_address ?? null,
    discountCode: row.discount_code ?? null,
    discountAmount: Number(row.discount_amount ?? 0),
    paymentDiscountPercent: Number(row.payment_discount_percent ?? 0),
    paymentDiscountAmount: Number(row.payment_discount_amount ?? 0),
  };
}

// Teslimat adresini tek satırda gösterir: "Adres, Mahalle, İlçe / İl"
export function formatOrderAddress(order: Pick<OrderDetail, "shippingAddress" | "neighbourhood" | "district" | "city">): string {
  const region = [order.district, order.city].filter(Boolean).join(" / ");
  return [order.shippingAddress, order.neighbourhood, region].filter(Boolean).join(", ");
}

export async function getMyOrders(): Promise<OrderDetail[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyOrders error:", error.message);
    return [];
  }

  return data.map(mapOrder);
}

export async function getMyOrderById(orderId: string): Promise<OrderDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return mapOrder(data);
}

export type AdminOrderSummary = OrderDetail;

export interface AdminOrderFilters {
  q?: string;
  status?: string;
  payment?: string;
  page?: number;
  pageSize?: number;
}

// Admin sipariş listesi: arama + durum/ödeme filtresi + sayfalama (veritabanında yapılır)
export async function searchOrdersForAdmin(
  filters: AdminOrderFilters,
): Promise<{ orders: AdminOrderSummary[]; total: number }> {
  const pageSize = filters.pageSize ?? 25;
  const page = Math.max(1, filters.page ?? 1);
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(ORDER_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (filters.status) query = query.eq("status", filters.status);
  query = applySearchFilters(query, filters);

  const { data, error, count } = await query;

  if (error) {
    console.error("searchOrdersForAdmin error:", error.message);
    return { orders: [], total: 0 };
  }

  return { orders: data.map(mapOrder), total: count ?? 0 };
}

// Arama + ödeme filtresi (liste ve sekme sayıları aynı filtreyi kullanır)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applySearchFilters<T extends { eq: any; or: any }>(query: T, filters: AdminOrderFilters): T {
  if (filters.payment) query = query.eq("payment_method", filters.payment);

  const q = filters.q?.trim().replace(/[,()%]/g, " ").trim();
  if (q) {
    const pattern = `%${q}%`;
    query = query.or(
      `order_number.ilike.${pattern},guest_name.ilike.${pattern},guest_email.ilike.${pattern},guest_phone.ilike.${pattern}`,
    );
  }
  return query;
}

// Admin sipariş sekmeleri için durum başına sipariş sayısı
export async function getOrderStatusCounts(
  statuses: string[],
  filters: Pick<AdminOrderFilters, "q" | "payment"> = {},
): Promise<Record<string, number>> {
  const supabase = await createClient();
  const results = await Promise.all(
    statuses.map(async (status) => {
      const { count, error } = await applySearchFilters(
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", status),
        filters,
      );
      if (error) console.error("getOrderStatusCounts error:", error.message);
      return [status, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(results);
}

export async function getOrderForAdmin(orderId: string): Promise<AdminOrderSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) return null;
  return mapOrder(data);
}

export async function getOrdersForCustomer(customerId: string): Promise<AdminOrderSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data.map(mapOrder);
}

export interface OrderEvent {
  id: string;
  kind: string;
  fromValue: string | null;
  toValue: string | null;
  message: string | null;
  createdAt: string;
}

export async function getOrderEvents(orderId: string): Promise<OrderEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_events")
    .select("id, kind, from_value, to_value, message, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error) {
    // 032 migration'ı henüz çalıştırılmadıysa tablo yoktur
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    kind: row.kind,
    fromValue: row.from_value,
    toValue: row.to_value,
    message: row.message,
    createdAt: row.created_at,
  }));
}
