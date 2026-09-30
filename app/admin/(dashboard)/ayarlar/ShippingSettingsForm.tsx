"use client";

import { useActionState } from "react";
import { updateShippingSettings } from "@/app/admin/actions";
import type { ActionState } from "@/app/admin/actions";
import type { ShippingSettings } from "@/lib/shipping";

const initialState: ActionState = {};

export default function ShippingSettingsForm({ settings }: { settings: ShippingSettings }) {
  const [state, formAction, pending] = useActionState(updateShippingSettings, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">
          Ücretsiz Kargo Eşiği (₺)
        </label>
        <input
          name="freeShippingThreshold"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={settings.freeShippingThreshold}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">
          Standart Kargo Ücreti (₺, sabit — sepetteki ilk ürün için)
        </label>
        <input
          name="standardShippingFee"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={settings.standardShippingFee}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">
          Parça Başına Ek Ücret (₺, ikinci üründen itibaren her ürün için)
        </label>
        <input
          name="perItemFee"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={settings.perItemFee}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>

      {state.error && <p className="text-xs text-status-red-fg">{state.error}</p>}
      {state !== initialState && !state.error && !pending && (
        <p className="text-xs text-status-green-fg">Kaydedildi.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-fit bg-ink px-8 py-3 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
      >
        {pending ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}
