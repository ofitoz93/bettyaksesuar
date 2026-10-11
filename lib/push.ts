import webpush from "web-push";
import { createServiceClient } from "@/lib/supabase/service";
import { formatPrice, paymentLabel } from "@/lib/orders";

// Admin uygulamasına (ana ekrana eklenen panel) push bildirimi gönderir.
// Yalnızca sunucuda kullanılır; müşteri işlemlerinden de tetiklendiği için
// abonelikler service_role ile okunur.

export type AdminPushEvent =
  | "new_order"
  | "order_cancelled"
  | "return_request"
  | "stock_request"
  | "low_stock";

export interface AdminPushMessage {
  title: string;
  body: string;
  // Bildirime dokununca açılacak admin sayfası
  url: string;
  // Aynı tag'li bildirimler üst üste binmek yerine birbirinin yerine geçer
  tag?: string;
}

const EVENT_COLUMN: Record<AdminPushEvent, string> = {
  new_order: "notify_new_order",
  order_cancelled: "notify_order_cancelled",
  return_request: "notify_return_request",
  stock_request: "notify_stock_request",
  low_stock: "notify_low_stock",
};

const LOW_STOCK_THRESHOLD = 5;

let vapidReady: boolean | null = null;
function ensureVapid(): boolean {
  if (vapidReady !== null) return vapidReady;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("Push bildirimi atlandı: VAPID anahtarları veya SUPABASE_SERVICE_ROLE_KEY eksik");
    vapidReady = false;
    return false;
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    publicKey,
    privateKey,
  );
  vapidReady = true;
  return true;
}

interface SubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendToSubscriptions(
  rows: SubscriptionRow[],
  message: AdminPushMessage,
): Promise<{ sent: number; failed: number }> {
  if (!ensureVapid() || rows.length === 0) return { sent: 0, failed: 0 };
  const supabase = createServiceClient();
  const payload = JSON.stringify(message);
  const expired: string[] = [];
  const delivered: string[] = [];

  await Promise.all(
    rows.map(async (row) => {
      try {
        await webpush.sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
          payload,
          { TTL: 60 * 60 * 24, urgency: "high" },
        );
        delivered.push(row.id);
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        // 404/410: cihaz aboneliği iptal etmiş (uygulama silinmiş, izin kapatılmış)
        if (statusCode === 404 || statusCode === 410) expired.push(row.id);
        else console.error("push gönderilemedi:", statusCode, (err as Error).message);
      }
    }),
  );

  if (expired.length > 0) {
    await supabase.from("admin_push_subscriptions").delete().in("id", expired);
  }
  if (delivered.length > 0) {
    await supabase
      .from("admin_push_subscriptions")
      .update({ last_used_at: new Date().toISOString() })
      .in("id", delivered);
  }

  return { sent: delivered.length, failed: rows.length - delivered.length };
}

export async function notifyAdmins(event: AdminPushEvent, message: AdminPushMessage) {
  if (!ensureVapid()) return;
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("admin_push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq(EVENT_COLUMN[event], true);
    if (error) {
      console.error("notifyAdmins error:", error.message);
      return;
    }
    await sendToSubscriptions(data ?? [], message);
  } catch (err) {
    // Bildirim hatası asla müşterinin işlemini bozmamalı
    console.error("notifyAdmins error:", err);
  }
}

// Yeni sipariş bildirimi + siparişteki ürünlerden stoğu azalanlar için uyarı
export async function notifyNewOrder(orderId: string) {
  if (!ensureVapid()) return;
  try {
    const supabase = createServiceClient();
    const { data: order } = await supabase
      .from("orders")
      .select("id, order_number, guest_name, total, payment_method, order_items(product_id, quantity)")
      .eq("id", orderId)
      .maybeSingle();
    if (!order) return;

    const items = (order.order_items ?? []) as { product_id: string | null; quantity: number }[];
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    await notifyAdmins("new_order", {
      title: `🛍 Yeni sipariş · ${formatPrice(Number(order.total))}`,
      body: `${order.guest_name} · ${itemCount} ürün · ${paymentLabel(order.payment_method)}`,
      url: `/admin/siparisler/${order.id}`,
      tag: `order-${order.id}`,
    });

    const productIds = items.map((item) => item.product_id).filter((id): id is string => Boolean(id));
    if (productIds.length === 0) return;
    const { data: lowStock } = await supabase
      .from("products")
      .select("id, name, stock")
      .in("id", productIds)
      .lte("stock", LOW_STOCK_THRESHOLD);

    for (const product of lowStock ?? []) {
      await notifyAdmins("low_stock", {
        title: product.stock === 0 ? `⚠️ Stok tükendi: ${product.name}` : `⚠️ Stok azaldı: ${product.name}`,
        body: product.stock === 0 ? "Ürün artık satın alınamıyor." : `Stokta ${product.stock} adet kaldı.`,
        url: `/admin/urun/${product.id}`,
        tag: `stock-${product.id}`,
      });
    }
  } catch (err) {
    console.error("notifyNewOrder error:", err);
  }
}
