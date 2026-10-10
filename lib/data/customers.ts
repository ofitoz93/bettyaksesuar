import { createServiceClient } from "@/lib/supabase/service";
import { getCurrentProfile } from "@/lib/data/profile";

export interface CustomerSummary {
  id: string;
  email: string;
  fullName: string | null;
  username: string | null;
  phone: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

// Service role RLS'i atladığı için yalnızca admin oturumunda çalışır
async function getAdminServiceClient() {
  const profile = await getCurrentProfile();
  if (!profile?.isAdmin) return null;

  try {
    return createServiceClient();
  } catch {
    // SUPABASE_SERVICE_ROLE_KEY tanımlı değil — müşteri listesi (e-posta bilgisi
    // auth.users'ta olduğu için) service role olmadan okunamaz.
    return null;
  }
}

interface OrderStatRow {
  customer_id: string;
  total: number | string;
  status: string;
  created_at: string;
}

function buildOrderStats(orders: OrderStatRow[]) {
  const stats = new Map<string, { count: number; spent: number; last: string | null }>();
  for (const order of orders) {
    const entry = stats.get(order.customer_id) ?? { count: 0, spent: 0, last: null };
    entry.count += 1;
    // İptal edilen siparişler harcamaya sayılmaz
    if (order.status !== "iptal") entry.spent += Number(order.total);
    if (!entry.last || order.created_at > entry.last) entry.last = order.created_at;
    stats.set(order.customer_id, entry);
  }
  return stats;
}

export async function getCustomers(search?: string): Promise<CustomerSummary[]> {
  const service = await getAdminServiceClient();
  if (!service) return [];

  const [{ data: profiles }, { data: users }, { data: orders }] = await Promise.all([
    service
      .from("profiles")
      .select("id, full_name, username, phone, role, created_at")
      .eq("role", "customer"),
    service.auth.admin.listUsers({ perPage: 1000 }),
    service
      .from("orders")
      .select("customer_id, total, status, created_at")
      .not("customer_id", "is", null),
  ]);

  const stats = buildOrderStats((orders ?? []) as OrderStatRow[]);
  const userById = new Map(users?.users.map((u) => [u.id, u]) ?? []);

  const customers = (profiles ?? []).map((profile) => {
    const user = userById.get(profile.id);
    const stat = stats.get(profile.id);
    return {
      id: profile.id,
      email: user?.email ?? "",
      fullName: profile.full_name,
      username: profile.username,
      phone: profile.phone,
      createdAt: profile.created_at,
      lastSignInAt: user?.last_sign_in_at ?? null,
      orderCount: stat?.count ?? 0,
      totalSpent: stat?.spent ?? 0,
      lastOrderAt: stat?.last ?? null,
    };
  });

  const q = search?.trim().toLocaleLowerCase("tr-TR");
  const filtered = q
    ? customers.filter((c) =>
        [c.fullName, c.email, c.phone].some((v) => v?.toLocaleLowerCase("tr-TR").includes(q)),
      )
    : customers;

  return filtered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getCustomerById(id: string): Promise<CustomerSummary | null> {
  const service = await getAdminServiceClient();
  if (!service) return null;

  const [{ data: profile }, { data: userData }, { data: orders }] = await Promise.all([
    service
      .from("profiles")
      .select("id, full_name, username, phone, created_at")
      .eq("id", id)
      .maybeSingle(),
    service.auth.admin.getUserById(id),
    service.from("orders").select("customer_id, total, status, created_at").eq("customer_id", id),
  ]);

  if (!profile) return null;

  const stat = buildOrderStats((orders ?? []) as OrderStatRow[]).get(id);

  return {
    id: profile.id,
    email: userData?.user?.email ?? "",
    fullName: profile.full_name,
    username: profile.username,
    phone: profile.phone,
    createdAt: profile.created_at,
    lastSignInAt: userData?.user?.last_sign_in_at ?? null,
    orderCount: stat?.count ?? 0,
    totalSpent: stat?.spent ?? 0,
    lastOrderAt: stat?.last ?? null,
  };
}
