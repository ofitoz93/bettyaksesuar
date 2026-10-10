"use server";

import { createClient } from "@/lib/supabase/server";
import { getCustomers } from "@/lib/data/customers";
import { getCurrentProfile } from "@/lib/data/profile";
import { formatPrice, statusLabel } from "@/lib/orders";

export interface AdminSearchResult {
  group: "Siparişler" | "Ürünler" | "Müşteriler";
  title: string;
  subtitle: string;
  href: string;
}

// Ctrl+K hızlı arama: sipariş, ürün ve müşterilerde aynı anda arar
export async function adminSearch(rawQuery: string): Promise<AdminSearchResult[]> {
  const profile = await getCurrentProfile();
  if (!profile?.isAdmin) return [];

  const q = rawQuery.trim().replace(/[,()%]/g, " ").trim();
  if (q.length < 2) return [];

  const supabase = await createClient();
  const pattern = `%${q}%`;

  const [ordersRes, productsRes, customers] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_number, guest_name, status, total")
      .or(`order_number.ilike.${pattern},guest_name.ilike.${pattern},guest_email.ilike.${pattern},guest_phone.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("products")
      .select("id, name, sku, price, stock")
      .or(`name.ilike.${pattern},sku.ilike.${pattern}`)
      .limit(5),
    getCustomers(q),
  ]);

  const results: AdminSearchResult[] = [];

  for (const order of ordersRes.data ?? []) {
    results.push({
      group: "Siparişler",
      title: order.order_number,
      subtitle: `${order.guest_name} · ${statusLabel(order.status)} · ${formatPrice(Number(order.total))}`,
      href: `/admin/siparisler/${order.id}`,
    });
  }

  for (const product of productsRes.data ?? []) {
    results.push({
      group: "Ürünler",
      title: product.name,
      subtitle: `${product.sku ? `${product.sku} · ` : ""}${formatPrice(Number(product.price))} · Stok: ${product.stock}`,
      href: `/admin/urun/${product.id}`,
    });
  }

  for (const customer of customers.slice(0, 5)) {
    results.push({
      group: "Müşteriler",
      title: customer.fullName || customer.email,
      subtitle: `${customer.email} · ${customer.orderCount} sipariş`,
      href: `/admin/musteriler/${customer.id}`,
    });
  }

  return results;
}
