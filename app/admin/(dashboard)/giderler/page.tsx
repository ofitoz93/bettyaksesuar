import Link from "next/link";
import { getExpenses } from "@/lib/data/finance";
import {
  currentMonthKey,
  expenseCategoryLabel,
  isMonthKey,
  monthLabel,
  shiftMonth,
  todayDateKey,
} from "@/lib/finance";
import { formatPrice } from "@/lib/orders";
import ExpenseForm from "./ExpenseForm";
import DeleteExpenseButton from "./DeleteExpenseButton";

export default async function GiderlerPage({
  searchParams,
}: {
  searchParams: Promise<{ ay?: string }>;
}) {
  const { ay } = await searchParams;
  const thisMonth = currentMonthKey();
  const selectedMonth = isMonthKey(ay) ? ay : thisMonth;
  const nextMonth = shiftMonth(selectedMonth, 1);
  const expenses = await getExpenses(`${selectedMonth}-01`, `${nextMonth}-01`);
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const today = todayDateKey();
  const defaultDate = today.startsWith(selectedMonth) ? today : `${selectedMonth}-01`;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[28px]">Giderler</h1>
        <div className="flex items-center gap-1 text-sm">
          <Link
            href={`/admin/giderler?ay=${shiftMonth(selectedMonth, -1)}`}
            className="border border-line bg-white px-3 py-1.5 hover:border-ink"
            aria-label="Önceki ay"
          >
            ‹
          </Link>
          <span className="min-w-32 text-center font-medium">{monthLabel(selectedMonth)}</span>
          <Link
            href={`/admin/giderler?ay=${nextMonth}`}
            className="border border-line bg-white px-3 py-1.5 hover:border-ink"
            aria-label="Sonraki ay"
          >
            ›
          </Link>
        </div>
      </div>
      <p className="mb-6 text-sm text-ink-soft">
        Kargo firmasına ödenen ücretler, reklam, paketleme, komisyon, kira gibi masrafları buraya
        girin; <Link href={`/admin/kar-zarar?ay=${selectedMonth}`} className="underline hover:text-ink">Kâr-Zarar</Link>{" "}
        sayfasında net kârdan düşülür. Ürün alış maliyetlerini buraya girmeyin, onlar{" "}
        <Link href="/admin/alis-fiyatlari" className="underline hover:text-ink">Alış Fiyatları</Link>{" "}
        üzerinden satışlara göre otomatik hesaplanır.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <section className="h-fit border border-line bg-white p-5">
          <h2 className="mb-4 text-sm font-medium">Yeni Gider</h2>
          <ExpenseForm defaultDate={defaultDate} />
        </section>

        <section className="border border-line bg-white">
          <div className="flex items-baseline justify-between gap-3 px-5 pt-5 pb-3">
            <h2 className="text-sm font-medium">{monthLabel(selectedMonth)} Giderleri</h2>
            <span className="text-sm">
              Toplam <strong>{formatPrice(Math.round(total * 100) / 100)}</strong>
            </span>
          </div>
          {expenses.length === 0 ? (
            <p className="border-t border-line px-5 py-10 text-center text-sm text-ink-soft">
              Bu ay için girilmiş gider yok.
            </p>
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {expenses.map((expense) => (
                <li key={expense.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{expenseCategoryLabel(expense.category)}</div>
                    <div className="truncate text-xs text-ink-faint">
                      {new Date(`${expense.date}T12:00:00`).toLocaleDateString("tr-TR")}
                      {expense.description && ` · ${expense.description}`}
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-medium">{formatPrice(expense.amount)}</span>
                  <DeleteExpenseButton id={expense.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
