import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  monthRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingReturns: number;
  pendingStockRequests: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    { count: totalOrders },
    { count: pendingOrders },
    { data: monthOrders },
    { count: totalProducts },
    { count: lowStockProducts },
    { count: pendingReturns },
    { count: pendingStockRequests },
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "beklemede"),
    supabase
      .from("orders")
      .select("total")
      .gte("created_at", monthStart.toISOString())
      .neq("status", "iptal"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).lte("stock", 5),
    supabase
      .from("return_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "beklemede"),
    supabase
      .from("stock_notifications")
      .select("id", { count: "exact", head: true })
      .is("notified_at", null),
  ]);

  const monthRevenue = (monthOrders ?? []).reduce((sum, o) => sum + Number(o.total), 0);

  return {
    totalOrders: totalOrders ?? 0,
    pendingOrders: pendingOrders ?? 0,
    monthRevenue,
    totalProducts: totalProducts ?? 0,
    lowStockProducts: lowStockProducts ?? 0,
    pendingReturns: pendingReturns ?? 0,
    pendingStockRequests: pendingStockRequests ?? 0,
  };
}
