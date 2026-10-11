import { createClient } from "@/lib/supabase/server";
import CostPriceTable, { type CostRow } from "./CostPriceTable";

export default async function AlisFiyatlariPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, is_active, product_images(url, position), product_costs(cost_price)")
    .order("name", { ascending: true });
  if (error) console.error("alis-fiyatlari error:", error.message);

  const rows: CostRow[] = (data ?? []).map((row) => {
    const images = ((row.product_images ?? []) as { url: string; position: number }[])
      .slice()
      .sort((a, b) => a.position - b.position);
    const cost = row.product_costs as unknown as { cost_price: number } | null;
    return {
      id: row.id,
      name: row.name,
      price: Number(row.price),
      isActive: row.is_active,
      image: images[0]?.url ?? null,
      costPrice: cost ? Number(cost.cost_price) : null,
    };
  });
  const missing = rows.filter((r) => r.costPrice === null).length;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h1 className="font-display text-[28px]">Alış Fiyatları</h1>
        <span className="text-xs text-ink-soft">
          {rows.length} ürün{missing > 0 && ` · ${missing} eksik`}
        </span>
      </div>
      <p className="mb-6 text-sm text-ink-soft">
        Her ürünü kaça aldığınızı (birim maliyet) girin. Kâr-Zarar sayfası satışların kârını bu
        fiyatlarla hesaplar; her satışta o anki alış fiyatı saklanır, yani fiyatı sonradan
        değiştirmek geçmiş satışların kârını değiştirmez. Alış fiyatlarını yalnızca adminler görür.
      </p>
      <CostPriceTable rows={rows} />
    </div>
  );
}
