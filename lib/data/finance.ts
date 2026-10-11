import { createClient } from "@/lib/supabase/server";
import { monthKeyOf, monthStartIso, shiftMonth } from "@/lib/finance";

// Kâr-zarar hesabı.
// Ciroya yalnızca gerçekleşen satışlar sayılır: teslim edilen ya da ödemesi alınan,
// iptal edilmemiş ve iadesi onaylanmamış siparişler. Diğer açık siparişler
// "beklenen ciro" olarak ayrıca gösterilir. Siparişler oluşturuldukları aya yazılır.

export interface MonthSummary {
  month: string;
  orderCount: number;
  // Müşteriden alınan toplam (indirimler düşülmüş, kargo ücreti dahil)
  revenue: number;
  productSales: number;
  shippingCollected: number;
  discounts: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  // Alış fiyatı girilmemiş ürün adedi (bu ürünlerin maliyeti 0 sayıldı)
  missingCostUnits: number;
  pendingCount: number;
  pendingRevenue: number;
  refundCount: number;
  refundAmount: number;
}

export interface ProductProfit {
  name: string;
  quantity: number;
  sales: number;
  cost: number;
  profit: number;
  missingCost: boolean;
}

export interface ExpenseRow {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string | null;
}

export interface ProfitLossReport {
  months: MonthSummary[];
  selected: MonthSummary;
  topProducts: ProductProfit[];
  expensesByCategory: { category: string; amount: number }[];
}

interface OrderItemRow {
  product_id: string | null;
  product_name: string;
  quantity: number;
  line_total: number;
  order_item_costs: { unit_cost: number } | null;
}

interface OrderRow {
  id: string;
  created_at: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  payment_discount_amount: number;
  order_items: OrderItemRow[] | null;
}

const PAGE_SIZE = 1000;

function emptyMonth(month: string): MonthSummary {
  return {
    month,
    orderCount: 0,
    revenue: 0,
    productSales: 0,
    shippingCollected: 0,
    discounts: 0,
    cogs: 0,
    grossProfit: 0,
    expenses: 0,
    netProfit: 0,
    missingCostUnits: 0,
    pendingCount: 0,
    pendingRevenue: 0,
    refundCount: 0,
    refundAmount: 0,
  };
}

const round2 = (value: number) => Math.round(value * 100) / 100;

export async function getExpenses(fromDate: string, toDate: string): Promise<ExpenseRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("id, expense_date, category, amount, description")
    .gte("expense_date", fromDate)
    .lt("expense_date", toDate)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getExpenses error:", error.message);
    return [];
  }
  return data.map((row) => ({
    id: row.id,
    date: row.expense_date,
    category: row.category,
    amount: Number(row.amount),
    description: row.description,
  }));
}

// Son `monthCount` ay (seçilen ay dahil, ona kadar)
export async function getProfitLossReport(
  selectedMonth: string,
  monthCount = 12,
): Promise<ProfitLossReport> {
  const supabase = await createClient();
  const firstMonth = shiftMonth(selectedMonth, -(monthCount - 1));
  const afterLast = shiftMonth(selectedMonth, 1);
  const fromIso = monthStartIso(firstMonth);
  const toIso = monthStartIso(afterLast);

  const orders: OrderRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, created_at, status, payment_status, total, subtotal, shipping_fee, discount_amount, payment_discount_amount, order_items(product_id, product_name, quantity, line_total, order_item_costs(unit_cost))",
      )
      .gte("created_at", fromIso)
      .lt("created_at", toIso)
      .neq("status", "iptal")
      .order("created_at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) {
      console.error("getProfitLossReport orders error:", error.message);
      break;
    }
    orders.push(...(data as unknown as OrderRow[]));
    if (data.length < PAGE_SIZE) break;
  }

  const orderIds = orders.map((o) => o.id);
  const [{ data: returns }, { data: costs }, expenses] = await Promise.all([
    orderIds.length > 0
      ? supabase
          .from("return_requests")
          .select("order_id")
          .in("status", ["onaylandi", "tamamlandi"])
          .gte("created_at", fromIso)
      : Promise.resolve({ data: [] as { order_id: string }[] }),
    supabase.from("product_costs").select("product_id, cost_price"),
    getExpenses(firstMonth + "-01", afterLast + "-01"),
  ]);

  const returnedOrders = new Set((returns ?? []).map((r) => r.order_id));
  // Satış anında maliyet kaydı yoksa (alış fiyatı sonradan girildiyse) bugünkü alış fiyatı kullanılır
  const currentCost = new Map((costs ?? []).map((c) => [c.product_id, Number(c.cost_price)]));

  const months = new Map<string, MonthSummary>();
  for (let i = 0; i < monthCount; i++) {
    const key = shiftMonth(firstMonth, i);
    months.set(key, emptyMonth(key));
  }

  const productTotals = new Map<string, ProductProfit>();

  for (const order of orders) {
    const summary = months.get(monthKeyOf(order.created_at));
    if (!summary) continue;
    const total = Number(order.total);

    if (returnedOrders.has(order.id)) {
      summary.refundCount += 1;
      summary.refundAmount += total;
      continue;
    }

    const realized = order.status === "teslim_edildi" || order.payment_status === "odendi";
    if (!realized) {
      summary.pendingCount += 1;
      summary.pendingRevenue += total;
      continue;
    }

    summary.orderCount += 1;
    summary.revenue += total;
    summary.productSales += Number(order.subtotal);
    summary.shippingCollected += Number(order.shipping_fee);
    summary.discounts += Number(order.discount_amount) + Number(order.payment_discount_amount);

    for (const item of order.order_items ?? []) {
      const unitCost =
        item.order_item_costs?.unit_cost != null
          ? Number(item.order_item_costs.unit_cost)
          : item.product_id
            ? currentCost.get(item.product_id)
            : undefined;
      const lineCost = unitCost !== undefined ? unitCost * item.quantity : 0;
      if (unitCost === undefined) summary.missingCostUnits += item.quantity;
      summary.cogs += lineCost;

      if (summary.month === selectedMonth) {
        const entry = productTotals.get(item.product_name) ?? {
          name: item.product_name,
          quantity: 0,
          sales: 0,
          cost: 0,
          profit: 0,
          missingCost: false,
        };
        entry.quantity += item.quantity;
        entry.sales += Number(item.line_total);
        entry.cost += lineCost;
        entry.profit = entry.sales - entry.cost;
        if (unitCost === undefined) entry.missingCost = true;
        productTotals.set(item.product_name, entry);
      }
    }
  }

  const expenseTotals = new Map<string, number>();
  for (const expense of expenses) {
    const summary = months.get(expense.date.slice(0, 7));
    if (summary) summary.expenses += expense.amount;
    if (expense.date.startsWith(selectedMonth)) {
      expenseTotals.set(expense.category, (expenseTotals.get(expense.category) ?? 0) + expense.amount);
    }
  }

  const monthList = Array.from(months.values()).map((m) => {
    const grossProfit = m.revenue - m.cogs;
    return {
      ...m,
      revenue: round2(m.revenue),
      productSales: round2(m.productSales),
      shippingCollected: round2(m.shippingCollected),
      discounts: round2(m.discounts),
      cogs: round2(m.cogs),
      grossProfit: round2(grossProfit),
      expenses: round2(m.expenses),
      netProfit: round2(grossProfit - m.expenses),
      pendingRevenue: round2(m.pendingRevenue),
      refundAmount: round2(m.refundAmount),
    };
  });

  return {
    months: monthList,
    selected: monthList.find((m) => m.month === selectedMonth) ?? emptyMonth(selectedMonth),
    topProducts: Array.from(productTotals.values())
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10),
    expensesByCategory: Array.from(expenseTotals.entries())
      .map(([category, amount]) => ({ category, amount: round2(amount) }))
      .sort((a, b) => b.amount - a.amount),
  };
}
