import { createClient } from "@/lib/supabase/server";
import { getProductsByIds } from "@/lib/data/products";
import { sendEmail } from "@/lib/email";

export interface StockNotificationGroup {
  productId: string;
  productName: string;
  productSlug: string;
  requests: { id: string; email: string; createdAt: string }[];
}

interface StockNotificationRow {
  id: string;
  product_id: string;
  email: string;
  created_at: string;
}

export async function getPendingStockNotificationsForAdmin(): Promise<StockNotificationGroup[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stock_notifications")
    .select("id, product_id, email, created_at")
    .is("notified_at", null)
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    if (error) console.error("getPendingStockNotificationsForAdmin error:", error.message);
    return [];
  }

  const rows = data as StockNotificationRow[];
  const productIds = Array.from(new Set(rows.map((row) => row.product_id)));
  const products = await getProductsByIds(productIds);
  const productMap = new Map(products.map((p) => [p.id, p]));

  const groups = new Map<string, StockNotificationGroup>();
  for (const row of rows) {
    if (!groups.has(row.product_id)) {
      const product = productMap.get(row.product_id);
      groups.set(row.product_id, {
        productId: row.product_id,
        productName: product?.name ?? "Silinmiş ürün",
        productSlug: product?.slug ?? "",
        requests: [],
      });
    }
    groups.get(row.product_id)!.requests.push({
      id: row.id,
      email: row.email,
      createdAt: row.created_at,
    });
  }

  return Array.from(groups.values());
}

export async function getPendingStockNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("stock_notifications")
    .select("id", { count: "exact", head: true })
    .is("notified_at", null);
  return count ?? 0;
}

export async function notifyBackInStockCustomers(
  productId: string,
  productName: string,
  productSlug: string,
): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stock_notifications")
    .select("id, email")
    .eq("product_id", productId)
    .is("notified_at", null);

  if (error || !data || data.length === 0) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const productUrl = `${siteUrl}/urun/${productSlug}`;

  for (const row of data as { id: string; email: string }[]) {
    const sent = await sendEmail({
      to: row.email,
      subject: `${productName} tekrar stokta!`,
      html: `<p>Merhaba,</p><p>Haber vermenizi istediğiniz <strong>${productName}</strong> ürünü tekrar stoğa girdi.</p><p><a href="${productUrl}">Hemen incelemek için tıklayın</a></p>`,
    });

    if (sent) {
      await supabase
        .from("stock_notifications")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", row.id);
    }
  }
}
