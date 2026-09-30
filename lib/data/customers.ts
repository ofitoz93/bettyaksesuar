import { createServiceClient } from "@/lib/supabase/service";

export interface CustomerSummary {
  id: string;
  email: string;
  fullName: string | null;
  username: string | null;
  phone: string | null;
  createdAt: string;
  orderCount: number;
}

export async function getCustomers(): Promise<CustomerSummary[]> {
  let service;
  try {
    service = createServiceClient();
  } catch {
    // SUPABASE_SERVICE_ROLE_KEY tanımlı değil — müşteri listesi (e-posta bilgisi
    // auth.users'ta olduğu için) service role olmadan okunamaz.
    return [];
  }

  const [{ data: profiles }, { data: users }, { data: orders }] = await Promise.all([
    service
      .from("profiles")
      .select("id, full_name, username, phone, role, created_at")
      .eq("role", "customer"),
    service.auth.admin.listUsers({ perPage: 1000 }),
    service.from("orders").select("customer_id").not("customer_id", "is", null),
  ]);

  const orderCountByCustomer = new Map<string, number>();
  for (const order of orders ?? []) {
    const id = order.customer_id as string;
    orderCountByCustomer.set(id, (orderCountByCustomer.get(id) ?? 0) + 1);
  }

  const emailById = new Map(users?.users.map((u) => [u.id, u.email ?? ""]) ?? []);

  return (profiles ?? [])
    .map((profile) => ({
      id: profile.id,
      email: emailById.get(profile.id) ?? "",
      fullName: profile.full_name,
      username: profile.username,
      phone: profile.phone,
      createdAt: profile.created_at,
      orderCount: orderCountByCustomer.get(profile.id) ?? 0,
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
