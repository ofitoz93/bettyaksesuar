import { getPendingStockNotificationCount } from "@/lib/data/stockNotifications";
import { getPendingReturnsCount } from "@/lib/data/returns";
import { getCurrentProfile } from "@/lib/data/profile";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pendingStock, pendingReturns, profile] = await Promise.all([
    getPendingStockNotificationCount(),
    getPendingReturnsCount(),
    getCurrentProfile(),
  ]);

  const displayName = profile?.fullName || profile?.email || "Admin";

  return (
    <AdminShell pendingStock={pendingStock} pendingReturns={pendingReturns} displayName={displayName}>
      {children}
    </AdminShell>
  );
}
