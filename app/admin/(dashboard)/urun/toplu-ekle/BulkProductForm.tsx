"use client";

import { useActionState, useState } from "react";
import { bulkCreateProducts, type BulkActionState } from "@/app/admin/actions";
import { categoryLabels } from "@/components/ui/CategoryIcon";

const categories = Object.keys(categoryLabels) as (keyof typeof categoryLabels)[];
const initialState: BulkActionState = {};

let rowIdCounter = 0;
function makeRowId() {
  rowIdCounter += 1;
  return `r${rowIdCounter}`;
}

export default function BulkProductForm() {
  const [state, formAction, pending] = useActionState(bulkCreateProducts, initialState);
  const [rowIds, setRowIds] = useState<string[]>(() => [makeRowId(), makeRowId(), makeRowId()]);

  const addRow = () => setRowIds((ids) => [...ids, makeRowId()]);
  const removeRow = (id: string) =>
    setRowIds((ids) => (ids.length > 1 ? ids.filter((rowId) => rowId !== id) : ids));

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {rowIds.map((id, index) => (
        <div key={id} className="border border-line bg-white p-5">
          <input type="hidden" name="rowIds" value={id} />
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide text-ink-soft uppercase">
              Ürün {index + 1}
            </span>
            {rowIds.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(id)}
                className="text-xs text-status-red-fg hover:opacity-70"
              >
                Satırı Sil
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ürün Adı">
              <input
                name={`name-${id}`}
                className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink"
              />
            </Field>
            <Field label="Ürün Kodu / Barkod (opsiyonel)">
              <input
                name={`sku-${id}`}
                className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink"
              />
            </Field>
            <Field label="Kategori">
              <select
                name={`category-${id}`}
                defaultValue=""
                className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink"
              >
                <option value="" disabled>
                  Kategori seçin
                </option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabels[category]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Stok Adedi">
              <input
                name={`stock-${id}`}
                type="number"
                min="0"
                defaultValue={0}
                className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink"
              />
            </Field>
            <Field label="Alış Fiyatı (₺, opsiyonel)">
              <input
                name={`costPrice-${id}`}
                type="number"
                step="0.01"
                min="0"
                className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink"
              />
            </Field>
            <Field label="Satış Fiyatı (₺)">
              <input
                name={`price-${id}`}
                type="number"
                step="0.01"
                min="0"
                className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink"
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Ürün Fotoğrafları (bilgisayardan seçin veya telefonda kameradan çekin)">
              <input
                name={`images-${id}`}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink"
              />
            </Field>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="w-fit border border-dashed border-ink px-6 py-3 text-xs font-medium tracking-[0.14em] uppercase hover:bg-ivory-deep"
      >
        + Ürün Satırı Ekle
      </button>

      {state.results && state.results.length > 0 && (
        <div className="border border-line bg-ivory-deep p-4 text-xs">
          <div className="mb-2 font-medium tracking-wide text-ink uppercase">Sonuç</div>
          {state.results.map((result, index) => (
            <div
              key={index}
              className={result.error ? "text-status-red-fg" : "text-gold-deep"}
            >
              {result.name}: {result.error ? `Hata — ${result.error}` : "Kaydedildi ✓"}
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-fit bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
      >
        {pending ? "Kaydediliyor..." : "Hepsini Kaydet"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">{label}</label>
      {children}
    </div>
  );
}
