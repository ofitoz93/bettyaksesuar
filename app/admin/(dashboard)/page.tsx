import Link from "next/link";
import { getDashboardStats } from "@/lib/data/dashboard";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Toplam Sipariş", value: stats.totalOrders, href: "/admin/siparisler" },
    { label: "Bekleyen Sipariş", value: stats.pendingOrders, href: "/admin/siparisler" },
    {
      label: "Bu Ay Ciro",
      value: `₺${stats.monthRevenue.toLocaleString("tr-TR")}`,
      href: "/admin/siparisler",
    },
    { label: "Toplam Ürün", value: stats.totalProducts, href: "/admin/urunler" },
    { label: "Düşük Stok (≤5)", value: stats.lowStockProducts, href: "/admin/urunler" },
    { label: "Bekleyen İade", value: stats.pendingReturns, href: "/admin/iadeler" },
    {
      label: "Bekleyen Stok Talebi",
      value: stats.pendingStockRequests,
      href: "/admin/stok-talepleri",
    },
  ];

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Kontrol Paneli</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="border border-line bg-white p-5 transition-colors hover:border-ink"
          >
            <div className="text-2xl">{card.value}</div>
            <div className="mt-1 text-xs tracking-wide text-ink-soft uppercase">{card.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
