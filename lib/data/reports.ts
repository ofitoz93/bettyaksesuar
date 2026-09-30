import { createClient } from "@/lib/supabase/server";

export interface SalesReport {
  monthRevenue: number;
  lastMonthRevenue: number;
  ordersByStatus: { status: string; count: number }[];
  ordersByPaymentMethod: { method: string; count: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  lowStockProducts: { name: string; stock: number }[];
}

export async function getSalesReport(): Promise<SalesReport> {
  const supabase = await createClient();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const lastMonthStart = new Date(monthStart);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

  const [
    { data: monthOrders },
    { data: lastMonthOrders },
    { data: allOrders },
    { data: orderItems },
    { data: lowStock },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("total")
      .gte("created_at", monthStart.toISOString())
      .neq("status", "iptal"),
    supabase
      .from("orders")
      .select("total")
      .gte("created_at", lastMonthStart.toISOString())
      .lt("created_at", monthStart.toISOString())
      .neq("status", "iptal"),
    supabase.from("orders").select("status, payment_method"),
    supabase
      .from("order_items")
      .select("product_name, quantity, line_total")
      .order("quantity", { ascending: false }),
    supabase.from("products").select("name, stock").lte("stock", 5).order("stock", { ascending: true }),
  ]);

  const monthRevenue = (monthOrders ?? []).reduce((sum, o) => sum + Number(o.total), 0);
  const lastMonthRevenue = (lastMonthOrders ?? []).reduce((sum, o) => sum + Number(o.total), 0);

  const statusCounts = new Map<string, number>();
  const paymentCounts = new Map<string, number>();
  for (const order of allOrders ?? []) {
    statusCounts.set(order.status, (statusCounts.get(order.status) ?? 0) + 1);
    paymentCounts.set(order.payment_method, (paymentCounts.get(order.payment_method) ?? 0) + 1);
  }

  const productTotals = new Map<string, { quantity: number; revenue: number }>();
  for (const item of orderItems ?? []) {
    const current = productTotals.get(item.product_name) ?? { quantity: 0, revenue: 0 };
    current.quantity += item.quantity;
    current.revenue += Number(item.line_total);
    productTotals.set(item.product_name, current);
  }
  const topProducts = Array.from(productTotals.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return {
    monthRevenue,
    lastMonthRevenue,
    ordersByStatus: Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count })),
    ordersByPaymentMethod: Array.from(paymentCounts.entries()).map(([method, count]) => ({
      method,
      count,
    })),
    topProducts,
    lowStockProducts: (lowStock ?? []).map((p) => ({ name: p.name, stock: p.stock })),
  };
}
