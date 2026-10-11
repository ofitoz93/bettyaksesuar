import Link from "next/link";
import { getProfitLossReport, type MonthSummary } from "@/lib/data/finance";
import {
  currentMonthKey,
  expenseCategoryLabel,
  isMonthKey,
  monthLabel,
  shiftMonth,
} from "@/lib/finance";
import { formatPrice } from "@/lib/orders";

function money(value: number): string {
  return value < 0 ? `−${formatPrice(Math.abs(value))}` : formatPrice(value);
}

function margin(m: MonthSummary): string {
  if (m.revenue <= 0) return "—";
  return `%${Math.round((m.netProfit / m.revenue) * 100)}`;
}

function profitTone(value: number): string {
  if (value > 0) return "text-status-green-fg";
  if (value < 0) return "text-status-red-fg";
  return "";
}

export default async function KarZararPage({
  searchParams,
}: {
  searchParams: Promise<{ ay?: string }>;
}) {
  const { ay } = await searchParams;
  const thisMonth = currentMonthKey();
  const selectedMonth = isMonthKey(ay) && ay <= thisMonth ? ay : thisMonth;
  const report = await getProfitLossReport(selectedMonth);
  const m = report.selected;

  const totals = report.months.reduce(
    (acc, row) => ({
      orderCount: acc.orderCount + row.orderCount,
      revenue: acc.revenue + row.revenue,
      cogs: acc.cogs + row.cogs,
      grossProfit: acc.grossProfit + row.grossProfit,
      expenses: acc.expenses + row.expenses,
      netProfit: acc.netProfit + row.netProfit,
      missingCostUnits: acc.missingCostUnits + row.missingCostUnits,
    }),
    { orderCount: 0, revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, netProfit: 0, missingCostUnits: 0 },
  );
  const chartMax = Math.max(
    1,
    ...report.months.map((row) => Math.max(row.revenue, Math.abs(row.netProfit))),
  );
  const prevMonth = shiftMonth(selectedMonth, -1);
  const nextMonth = shiftMonth(selectedMonth, 1);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[28px]">Kâr-Zarar</h1>
        <div className="flex items-center gap-1 text-sm">
          <Link
            href={`/admin/kar-zarar?ay=${prevMonth}`}
            className="border border-line bg-white px-3 py-1.5 hover:border-ink"
            aria-label="Önceki ay"
          >
            ‹
          </Link>
          <span className="min-w-32 text-center font-medium">{monthLabel(selectedMonth)}</span>
          {nextMonth <= thisMonth ? (
            <Link
              href={`/admin/kar-zarar?ay=${nextMonth}`}
              className="border border-line bg-white px-3 py-1.5 hover:border-ink"
              aria-label="Sonraki ay"
            >
              ›
            </Link>
          ) : (
            <span className="border border-line px-3 py-1.5 text-ink-faint">›</span>
          )}
        </div>
      </div>
      <p className="mb-6 text-sm text-ink-soft">
        Ciroya yalnızca <strong>teslim edilen veya ödemesi alınan</strong> siparişler sayılır.
        İptal edilen ve iadesi onaylanan siparişler hesaba katılmaz; henüz tamamlanmamış
        siparişler &ldquo;beklenen ciro&rdquo; olarak ayrıca gösterilir.
      </p>

      {totals.missingCostUnits > 0 && (
        <div className="mb-6 border border-status-amber-fg/30 bg-status-amber-bg px-4 py-3 text-sm text-status-amber-fg">
          Son 12 ayda satılan <strong>{totals.missingCostUnits} adet</strong> ürünün alış fiyatı
          girilmemiş. Bu ürünlerin maliyeti 0 sayıldığı için kâr olduğundan yüksek görünüyor.{" "}
          <Link href="/admin/alis-fiyatlari" className="font-medium underline">
            Alış fiyatlarını girin →
          </Link>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card label="Net Kâr" value={money(m.netProfit)} tone={profitTone(m.netProfit)} sub={`Kâr marjı ${margin(m)}`} />
        <Card label="Ciro" value={money(m.revenue)} sub={`${m.orderCount} sipariş`} />
        <Card label="Brüt Kâr" value={money(m.grossProfit)} sub={`Ürün maliyeti ${money(m.cogs)}`} />
        <Card
          label="Beklenen Ciro"
          value={money(m.pendingRevenue)}
          sub={`${m.pendingCount} sipariş tamamlanmadı`}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="border border-line bg-white p-5">
          <h2 className="mb-4 text-sm font-medium">{monthLabel(selectedMonth)} Kâr-Zarar Tablosu</h2>
          <dl className="flex flex-col text-sm">
            <Line label="Ürün satışları" value={money(m.productSales)} />
            <Line label="+ Müşteriden alınan kargo ücreti" value={money(m.shippingCollected)} />
            <Line label="− İndirimler" value={money(-m.discounts)} />
            <Line label="Ciro" value={money(m.revenue)} strong />
            <Line label="− Ürün maliyeti (alış fiyatları)" value={money(-m.cogs)} />
            <Line label="Brüt kâr" value={money(m.grossProfit)} strong />
            {report.expensesByCategory.map((row) => (
              <Line
                key={row.category}
                label={`− ${expenseCategoryLabel(row.category)}`}
                value={money(-row.amount)}
              />
            ))}
            {report.expensesByCategory.length === 0 && (
              <Line label="− Giderler" value={money(0)} />
            )}
            <Line label="Net kâr" value={money(m.netProfit)} strong tone={profitTone(m.netProfit)} />
          </dl>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
            <Link href={`/admin/giderler?ay=${selectedMonth}`} className="underline hover:text-ink">
              Bu ayın giderlerini düzenle
            </Link>
            {m.refundCount > 0 && (
              <span>
                {m.refundCount} sipariş iade edildi ({money(m.refundAmount)}), ciroya katılmadı.
              </span>
            )}
          </div>
        </section>

        <section className="border border-line bg-white p-5">
          <h2 className="mb-4 text-sm font-medium">Son 12 Ay</h2>
          <div className="flex h-44 items-end gap-1">
            {report.months.map((row) => (
              <Link
                key={row.month}
                href={`/admin/kar-zarar?ay=${row.month}`}
                title={`${monthLabel(row.month)} · Ciro ${money(row.revenue)} · Net kâr ${money(row.netProfit)}`}
                className={`flex h-full flex-1 flex-col justify-end gap-0.5 ${
                  row.month === selectedMonth ? "bg-gold-tint" : "hover:bg-ivory-deep/60"
                }`}
              >
                <div className="flex flex-1 items-end justify-center gap-px">
                  <div
                    className="w-1/2 max-w-3 bg-ink/25"
                    style={{ height: `${(row.revenue / chartMax) * 100}%` }}
                  />
                  <div
                    className={`w-1/2 max-w-3 ${row.netProfit < 0 ? "bg-status-red-fg" : "bg-gold-deep"}`}
                    style={{ height: `${(Math.abs(row.netProfit) / chartMax) * 100}%` }}
                  />
                </div>
                <span className="text-center text-[9px] leading-tight text-ink-faint">
                  {monthLabel(row.month, true).split(" ")[0]}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-ink-soft">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 bg-ink/25" /> Ciro
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 bg-gold-deep" /> Net kâr
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 bg-status-red-fg" /> Zarar
            </span>
          </div>
        </section>
      </div>

      <section className="mb-8 border border-line bg-white">
        <h2 className="px-5 pt-5 pb-3 text-sm font-medium">Aylık Tablo</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-y border-line text-left text-xs text-ink-soft">
                <th className="px-5 py-2 font-normal">Ay</th>
                <th className="px-3 py-2 text-right font-normal">Sipariş</th>
                <th className="px-3 py-2 text-right font-normal">Ciro</th>
                <th className="px-3 py-2 text-right font-normal">Ürün Maliyeti</th>
                <th className="px-3 py-2 text-right font-normal">Brüt Kâr</th>
                <th className="px-3 py-2 text-right font-normal">Giderler</th>
                <th className="px-3 py-2 text-right font-normal">Net Kâr</th>
                <th className="px-5 py-2 text-right font-normal">Marj</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {report.months
                .slice()
                .reverse()
                .map((row) => (
                  <tr key={row.month} className={row.month === selectedMonth ? "bg-gold-tint" : ""}>
                    <td className="px-5 py-2.5">
                      <Link href={`/admin/kar-zarar?ay=${row.month}`} className="hover:text-gold-deep">
                        {monthLabel(row.month)}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-right">{row.orderCount}</td>
                    <td className="px-3 py-2.5 text-right">{money(row.revenue)}</td>
                    <td className="px-3 py-2.5 text-right">{money(row.cogs)}</td>
                    <td className="px-3 py-2.5 text-right">{money(row.grossProfit)}</td>
                    <td className="px-3 py-2.5 text-right">{money(row.expenses)}</td>
                    <td className={`px-3 py-2.5 text-right font-medium ${profitTone(row.netProfit)}`}>
                      {money(row.netProfit)}
                    </td>
                    <td className="px-5 py-2.5 text-right text-ink-soft">{margin(row)}</td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-line font-medium">
                <td className="px-5 py-2.5">12 Ay Toplam</td>
                <td className="px-3 py-2.5 text-right">{totals.orderCount}</td>
                <td className="px-3 py-2.5 text-right">{money(totals.revenue)}</td>
                <td className="px-3 py-2.5 text-right">{money(totals.cogs)}</td>
                <td className="px-3 py-2.5 text-right">{money(totals.grossProfit)}</td>
                <td className="px-3 py-2.5 text-right">{money(totals.expenses)}</td>
                <td className={`px-3 py-2.5 text-right ${profitTone(totals.netProfit)}`}>
                  {money(totals.netProfit)}
                </td>
                <td className="px-5 py-2.5 text-right text-ink-soft">
                  {totals.revenue > 0 ? `%${Math.round((totals.netProfit / totals.revenue) * 100)}` : "—"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="mb-1 text-sm font-medium">{monthLabel(selectedMonth)} · En Kârlı Ürünler</h2>
        <p className="mb-4 text-xs text-ink-soft">Satış tutarları indirimlerden önceki ürün fiyatlarıdır.</p>
        {report.topProducts.length === 0 ? (
          <p className="text-sm text-ink-soft">Bu ay gerçekleşen satış yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-soft">
                  <th className="py-2 pr-3 font-normal">Ürün</th>
                  <th className="px-3 py-2 text-right font-normal">Adet</th>
                  <th className="px-3 py-2 text-right font-normal">Satış</th>
                  <th className="px-3 py-2 text-right font-normal">Maliyet</th>
                  <th className="py-2 pl-3 text-right font-normal">Kâr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {report.topProducts.map((product) => (
                  <tr key={product.name}>
                    <td className="py-2.5 pr-3">{product.name}</td>
                    <td className="px-3 py-2.5 text-right">{product.quantity}</td>
                    <td className="px-3 py-2.5 text-right">{money(product.sales)}</td>
                    <td className="px-3 py-2.5 text-right">
                      {product.missingCost ? (
                        <span className="text-status-amber-fg">Alış fiyatı yok</span>
                      ) : (
                        money(product.cost)
                      )}
                    </td>
                    <td className={`py-2.5 pl-3 text-right font-medium ${profitTone(product.profit)}`}>
                      {money(product.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Card({ label, value, sub, tone = "" }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="border border-line bg-white p-4">
      <div className="text-[11px] tracking-wide text-ink-soft uppercase">{label}</div>
      <div className={`mt-1 text-xl sm:text-2xl ${tone}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-ink-faint">{sub}</div>}
    </div>
  );
}

function Line({
  label,
  value,
  strong = false,
  tone = "",
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: string;
}) {
  return (
    <div
      className={`flex justify-between gap-4 py-1.5 ${strong ? "border-t border-line font-medium" : "text-ink-soft"}`}
    >
      <dt>{label}</dt>
      <dd className={tone || (strong ? "text-ink" : "")}>{value}</dd>
    </div>
  );
}
