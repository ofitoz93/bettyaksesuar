import Link from "next/link";
import { getPendingStockNotificationCount } from "@/lib/data/stockNotifications";
import { getPendingReturnsCount } from "@/lib/data/returns";
import { getCurrentProfile } from "@/lib/data/profile";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminUserMenu from "@/components/admin/AdminUserMenu";

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
    <div className="flex min-h-screen bg-ivory-deep">
      <AdminSidebar pendingStock={pendingStock} pendingReturns={pendingReturns} />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-line bg-white px-8 py-4">
          <Link href="/admin" className="font-display text-lg tracking-[0.2em]">
            BETTY AKSESUAR <span className="text-gold-deep">ADMIN</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              target="_blank"
              className="text-xs tracking-wide text-ink-soft hover:text-ink"
            >
              Siteyi Görüntüle ↗
            </Link>
            <AdminUserMenu displayName={displayName} />
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-8 py-10">{children}</main>
      </div>
    </div>
  );
}
