import { createClient } from "@/lib/supabase/server";

export async function getPendingReturnsCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("return_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "beklemede");
  return count ?? 0;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  reason: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
}

export async function getMyReturnRequests(): Promise<ReturnRequest[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("return_requests")
    .select("id, order_id, reason, status, admin_note, created_at")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyReturnRequests error:", error.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    orderId: row.order_id,
    reason: row.reason,
    status: row.status,
    adminNote: row.admin_note,
    createdAt: row.created_at,
  }));
}

export interface AdminReturnRequest extends ReturnRequest {
  orderNumber: string;
  guestName: string;
  guestEmail: string;
}

export async function getAllReturnRequestsForAdmin(): Promise<AdminReturnRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("return_requests")
    .select("id, order_id, reason, status, admin_note, created_at, orders(order_number, guest_name, guest_email)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllReturnRequestsForAdmin error:", error.message);
    return [];
  }

  return data.map((row) => {
    const order = row.orders as unknown as {
      order_number: string;
      guest_name: string;
      guest_email: string;
    } | null;

    return {
      id: row.id,
      orderId: row.order_id,
      reason: row.reason,
      status: row.status,
      adminNote: row.admin_note,
      createdAt: row.created_at,
      orderNumber: order?.order_number ?? "—",
      guestName: order?.guest_name ?? "—",
      guestEmail: order?.guest_email ?? "—",
    };
  });
}

