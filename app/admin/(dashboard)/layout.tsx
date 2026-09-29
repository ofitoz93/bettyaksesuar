import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { getPendingStockNotificationCount } from "@/lib/data/stockNotifications";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pendingStockRequests = await getPendingStockNotificationCount();

  return (
    <div className="min-h-screen bg-ivory-deep">
      <header className="border-b border-line bg-white px-8 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/admin" className="font-display text-lg tracking-[0.2em]">
            BETTY AKSESUAR <span className="text-gold-deep">ADMIN</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/admin/siparisler"
              className="text-xs tracking-wide text-ink-soft hover:text-ink"
            >
              Siparişler
            </Link>
            <Link
              href="/admin/iadeler"
              className="text-xs tracking-wide text-ink-soft hover:text-ink"
            >
              İadeler
            </Link>
            <Link
              href="/admin/stok-talepleri"
              className="flex items-center gap-1.5 text-xs tracking-wide text-ink-soft hover:text-ink"
            >
              Stok Talepleri
              {pendingStockRequests > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-deep px-1 text-[10px] font-medium text-white">
                  {pendingStockRequests}
                </span>
              )}
            </Link>
            <Link
              href="/admin/yorumlar"
              className="text-xs tracking-wide text-ink-soft hover:text-ink"
            >
              Yorumlar
            </Link>
            <Link
              href="/admin/ayarlar"
              className="text-xs tracking-wide text-ink-soft hover:text-ink"
            >
              Ayarlar
            </Link>
            <Link
              href="/"
              target="_blank"
              className="text-xs tracking-wide text-ink-soft hover:text-ink"
            >
              Siteyi Görüntüle ↗
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-xs tracking-wide text-ink-soft hover:text-ink"
              >
                Çıkış Yap
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-8 py-10">{children}</main>
    </div>
  );
}
