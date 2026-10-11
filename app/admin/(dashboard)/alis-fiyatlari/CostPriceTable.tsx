"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { saveCostPrices } from "@/app/admin/finance-actions";
import { formatPrice } from "@/lib/orders";

export interface CostRow {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  image: string | null;
  costPrice: number | null;
}

function toInput(value: number | null): string {
  return value === null ? "" : String(value);
}

function parseInput(value: string): number | null | "invalid" {
  const trimmed = value.trim().replace(",", ".");
  if (trimmed === "") return null;
  const number = Number(trimmed);
  return Number.isFinite(number) && number >= 0 ? number : "invalid";
}

export default function CostPriceTable({ rows }: { rows: CostRow[] }) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((r) => [r.id, toInput(r.costPrice)])),
  );
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const changes = rows.flatMap((row) => {
    const parsed = parseInput(values[row.id] ?? "");
    if (parsed === "invalid") return [{ productId: row.id, costPrice: NaN }];
    return parsed === row.costPrice ? [] : [{ productId: row.id, costPrice: parsed }];
  });
  const hasInvalid = changes.some((c) => Number.isNaN(c.costPrice));
  const visible = onlyMissing ? rows.filter((r) => r.costPrice === null) : rows;

  function save() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveCostPrices(changes);
      if (result.error) setMessage({ ok: false, text: result.error });
      else setMessage({ ok: true, text: `${result.saved} ürünün alış fiyatı kaydedildi.` });
    });
  }

  return (
    <div>
      <label className="mb-3 flex w-fit items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={onlyMissing}
          onChange={(e) => setOnlyMissing(e.target.checked)}
          className="h-4 w-4"
        />
        Yalnızca alış fiyatı girilmemiş ürünleri göster
      </label>

      {visible.length === 0 ? (
        <div className="border border-dashed border-line bg-white px-6 py-12 text-center text-sm text-ink-soft">
          Tüm ürünlerin alış fiyatı girilmiş. 🎉
        </div>
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {visible.map((row) => {
            const parsed = parseInput(values[row.id] ?? "");
            const cost = typeof parsed === "number" ? parsed : null;
            const profit = cost !== null ? row.price - cost : null;
            const marginPercent = profit !== null && row.price > 0 ? Math.round((profit / row.price) * 100) : null;
            return (
              <li key={row.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <Link href={`/admin/urun/${row.id}`} className="flex min-w-0 flex-1 basis-56 items-center gap-3">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden bg-linear-to-br from-[#EDE3D2] to-[#D9C7A6]">
                    {row.image && <Image src={row.image} alt="" fill sizes="44px" className="object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm hover:text-gold-deep">{row.name}</div>
                    <div className="text-xs text-ink-faint">
                      Satış {formatPrice(row.price)}
                      {!row.isActive && " · Pasif"}
                    </div>
                  </div>
                </Link>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`w-24 text-right text-xs ${
                      profit === null ? "text-ink-faint" : profit < 0 ? "text-status-red-fg" : "text-status-green-fg"
                    }`}
                  >
                    {profit === null ? "—" : `Kâr ${formatPrice(Math.round(profit * 100) / 100)} (%${marginPercent})`}
                  </span>
                  <label className="sr-only" htmlFor={`cost-${row.id}`}>
                    {row.name} alış fiyatı
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-ink-faint">
                      ₺
                    </span>
                    <input
                      id={`cost-${row.id}`}
                      type="text"
                      inputMode="decimal"
                      placeholder="Alış"
                      value={values[row.id] ?? ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, [row.id]: e.target.value }))}
                      className={`w-28 border bg-white py-1.5 pr-2.5 pl-6 text-sm outline-none focus:border-ink ${
                        parsed === "invalid" ? "border-status-red-fg" : "border-line"
                      }`}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="sticky bottom-0 -mx-4 mt-4 border-t border-line bg-ivory px-4 py-4 sm:mx-0 sm:px-0">
        <div className="flex flex-wrap items-center justify-end gap-3">
          {message && (
            <span className={`text-xs ${message.ok ? "text-status-green-fg" : "text-status-red-fg"}`}>
              {message.text}
            </span>
          )}
          {hasInvalid && <span className="text-xs text-status-red-fg">Geçersiz fiyatları düzeltin.</span>}
          <button
            type="button"
            onClick={save}
            disabled={pending || changes.length === 0 || hasInvalid}
            className="bg-ink px-6 py-2.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase hover:bg-gold-deep disabled:opacity-40"
          >
            {pending ? "Kaydediliyor..." : `Kaydet${changes.length > 0 ? ` (${changes.length})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
