import Link from "next/link";
import { Suspense } from "react";
import { getOrderStatusCounts, searchOrdersForAdmin } from "@/lib/data/orders";
import {
  ORDER_STATUSES,
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_TONE,
  formatPrice,
  paymentLabel,
  paymentStatusLabel,
  statusLabel,
} from "@/lib/orders";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import ListToolbar from "@/components/admin/ListToolbar";
import Pagination from "@/components/admin/Pagination";

const PAGE_SIZE = 25;
const ALL_TAB = "tumu";
const TAB_LABELS: Record<string, string> = {
  beklemede: "Bekleyen",
  onaylandi: "Onaylanan",
  kargoda: "Kargoda",
  teslim_edildi: "Teslim Edilen",
  iptal: "İptal",
};

export default async function AdminSiparislerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.sayfa) || 1);
  // Varsayılan sekme "Bekleyen"; ?durum=tumu tüm siparişleri gösterir
  const activeTab = params.durum === ALL_TAB || ORDER_STATUSES.includes(params.durum ?? "")
    ? params.durum!
    : "beklemede";
  const [{ orders, total }, counts] = await Promise.all([
    searchOrdersForAdmin({
      q: params.q,
      status: activeTab === ALL_TAB ? undefined : activeTab,
      payment: params.odeme,
      page,
      pageSize: PAGE_SIZE,
    }),
    getOrderStatusCounts(ORDER_STATUSES, { q: params.q, payment: params.odeme }),
  ]);
  const allCount = Object.values(counts).reduce((sum, n) => sum + n, 0);

  const tabHref = (tab: string) => {
    const next = new URLSearchParams();
    if (params.q) next.set("q", params.q);
    if (params.odeme) next.set("odeme", params.odeme);
    next.set("durum", tab);
    return `/admin/siparisler?${next}`;
  };

  const tabs = [
    ...ORDER_STATUSES.map((s) => ({ value: s, label: TAB_LABELS[s] ?? statusLabel(s), count: counts[s] ?? 0 })),
    { value: ALL_TAB, label: "Tümü", count: allCount },
  ];

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between gap-3">
        <h1 className="font-display text-[28px]">Siparişler</h1>
        <span className="text-xs text-ink-soft">{total} sipariş</span>
      </div>

      <nav className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Sipariş durumu">
        <div className="flex min-w-max gap-1 border-b border-line">
          {tabs.map((tab) => {
            const active = tab.value === activeTab;
            return (
              <Link
                key={tab.value}
                href={tabHref(tab.value)}
                aria-current={active ? "page" : undefined}
                className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm whitespace-nowrap ${
                  active
                    ? "border-ink font-medium text-ink"
                    : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {tab.label}
                <span
                  className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] ${
                    active
                      ? "bg-ink text-white"
                      : tab.value === "beklemede" && tab.count > 0
                        ? ORDER_STATUS_TONE.beklemede
                        : "bg-ivory text-ink-soft"
                  }`}
                >
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <Suspense>
        <ListToolbar
          placeholder="Sipariş no, müşteri adı, e-posta veya telefon ara..."
          keepParams={["durum"]}
          filters={[
            {
              name: "odeme",
              label: "Ödeme",
              options: ["kredi_karti", "havale", "kapida_odeme"].map((m) => ({
                value: m,
                label: paymentLabel(m),
              })),
            },
          ]}
        />
      </Suspense>

      {orders.length === 0 ? (
        <div className="border border-dashed border-line bg-white px-6 py-12 text-center text-sm text-ink-soft">
          {params.q || params.odeme
            ? "Bu filtrelere uyan sipariş bulunamadı."
            : activeTab === ALL_TAB
              ? "Henüz sipariş yok."
              : `${TAB_LABELS[activeTab] ?? statusLabel(activeTab)} sipariş yok.`}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-line bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] tracking-wide text-ink-soft uppercase">
                  <th className="px-4 py-3 font-medium">Sipariş</th>
                  <th className="px-4 py-3 font-medium">Tarih</th>
                  <th className="px-4 py-3 font-medium">Müşteri</th>
                  <th className="px-4 py-3 font-medium">Ödeme</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                  <th className="px-4 py-3 text-right font-medium">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const href = `/admin/siparisler/${order.id}`;
                  return (
                    <tr key={order.id} className="group border-b border-line last:border-0 hover:bg-ivory">
                      <td className="px-4 py-3">
                        <Link href={href} className="font-medium group-hover:text-gold-deep">
                          {order.orderNumber}
                        </Link>
                        <div className="text-xs text-ink-faint">
                          {order.items.reduce((sum, i) => sum + i.quantity, 0)} ürün
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-soft">
                        <Link href={href} className="block">
                          {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                          <div className="text-ink-faint">
                            {new Date(order.createdAt).toLocaleTimeString("tr-TR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={href} className="block">
                          {order.guestName}
                          <div className="text-xs text-ink-faint">
                            {order.city ?? order.guestEmail}
                            {!order.customerId && " · Misafir"}
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="text-ink-soft">{paymentLabel(order.paymentMethod)}</div>
                        {order.paymentMethod === "kredi_karti" && (
                          <span
                            className={`mt-1 inline-block px-2 py-0.5 text-[10px] uppercase ${
                              PAYMENT_STATUS_TONE[order.paymentStatus] ?? ""
                            }`}
                          >
                            {paymentStatusLabel(order.paymentStatus)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">{formatPrice(order.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            basePath="/admin/siparisler"
            searchParams={params}
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
          />
        </>
      )}
    </div>
  );
}
