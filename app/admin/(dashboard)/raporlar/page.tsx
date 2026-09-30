import { getSalesReport } from "@/lib/data/reports";
import { statusLabel, paymentLabel } from "@/lib/orders";

export default async function RaporlarPage() {
  const report = await getSalesReport();
  const revenueDiff = report.monthRevenue - report.lastMonthRevenue;
  const revenueDiffPercent =
    report.lastMonthRevenue > 0 ? Math.round((revenueDiff / report.lastMonthRevenue) * 100) : null;

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Raporlar</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="border border-line bg-white p-5">
          <div className="text-xs tracking-wide text-ink-soft uppercase">Bu Ay Ciro</div>
          <div className="mt-1 text-2xl">₺{report.monthRevenue.toLocaleString("tr-TR")}</div>
          {revenueDiffPercent !== null && (
            <div
              className={`mt-1 text-xs ${revenueDiff >= 0 ? "text-status-green-fg" : "text-status-red-fg"}`}
            >
              Geçen aya göre {revenueDiff >= 0 ? "+" : ""}
              {revenueDiffPercent}%
            </div>
          )}
        </div>
        <div className="border border-line bg-white p-5">
          <div className="text-xs tracking-wide text-ink-soft uppercase">Geçen Ay Ciro</div>
          <div className="mt-1 text-2xl">₺{report.lastMonthRevenue.toLocaleString("tr-TR")}</div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="border border-line bg-white p-5">
          <h2 className="mb-4 text-sm font-medium">Sipariş Durumu Dağılımı</h2>
          <div className="flex flex-col gap-2">
            {report.ordersByStatus.map((row) => (
              <div key={row.status} className="flex justify-between text-sm">
                <span className="text-ink-soft">{statusLabel(row.status)}</span>
                <span>{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-line bg-white p-5">
          <h2 className="mb-4 text-sm font-medium">Ödeme Yöntemi Dağılımı</h2>
          <div className="flex flex-col gap-2">
            {report.ordersByPaymentMethod.map((row) => (
              <div key={row.method} className="flex justify-between text-sm">
                <span className="text-ink-soft">{paymentLabel(row.method)}</span>
                <span>{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8 border border-line bg-white p-5">
        <h2 className="mb-4 text-sm font-medium">En Çok Satan Ürünler</h2>
        {report.topProducts.length === 0 ? (
          <p className="text-sm text-ink-soft">Henüz satış verisi yok.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {report.topProducts.map((product) => (
              <div key={product.name} className="flex justify-between text-sm">
                <span className="text-ink-soft">{product.name}</span>
                <span>
                  {product.quantity} adet · ₺{product.revenue.toLocaleString("tr-TR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border border-line bg-white p-5">
        <h2 className="mb-4 text-sm font-medium">Düşük Stok (≤5)</h2>
        {report.lowStockProducts.length === 0 ? (
          <p className="text-sm text-ink-soft">Düşük stoklu ürün yok.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {report.lowStockProducts.map((product) => (
              <div key={product.name} className="flex justify-between text-sm">
                <span className="text-ink-soft">{product.name}</span>
                <span className="text-status-red-fg">{product.stock} adet</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
