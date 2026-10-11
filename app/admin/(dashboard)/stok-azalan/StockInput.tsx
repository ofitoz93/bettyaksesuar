"use client";

import { useState, useTransition } from "react";
import { updateProductStock } from "@/app/admin/actions";

export default function StockInput({ productId, stock }: { productId: string; stock: number }) {
  const [value, setValue] = useState(String(stock));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const changed = value.trim() !== "" && Number(value) !== stock;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await updateProductStock(productId, Number(value));
          if (result.error) setError(result.error);
        });
      }}
      className="flex shrink-0 flex-col items-end gap-1"
    >
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={`stock-${productId}`}>
          Stok adedi
        </label>
        <input
          id={`stock-${productId}`}
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-20 border border-line bg-white px-2.5 py-1.5 text-sm outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={!changed || pending}
          className="bg-ink px-3 py-1.5 text-[11px] font-medium tracking-wide text-ivory uppercase hover:bg-gold-deep disabled:opacity-30"
        >
          {pending ? "..." : "Kaydet"}
        </button>
      </div>
      {error && <span className="text-[11px] text-status-red-fg">{error}</span>}
    </form>
  );
}
