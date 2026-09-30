"use client";

import { useActionState } from "react";
import { updateStoreProductListing, type ActionState } from "@/app/admin/actions";
import type { StoreSettings } from "@/lib/data/storeSettings";

const initialState: ActionState = {};

export default function UrunlerAyarForm({ settings }: { settings: StoreSettings }) {
  const [state, formAction, pending] = useActionState(updateStoreProductListing, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <Field label="Sayfa Başına Ürün Sayısı">
        <input
          name="productsPerPage"
          type="number"
          min="1"
          required
          defaultValue={settings.productsPerPage}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="showCategoryProductCount"
          defaultChecked={settings.showCategoryProductCount}
          className="h-4 w-4"
        />
        Kategori listesinde ürün sayısını göster
      </label>

      <div className="border-t border-line pt-5">
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            name="allowReviews"
            defaultChecked={settings.allowReviews}
            className="h-4 w-4"
          />
          Ürün yorumlarına izin ver
        </label>
        <label className="mt-3 flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            name="allowGuestReviews"
            defaultChecked={settings.allowGuestReviews}
            className="h-4 w-4"
          />
          Misafir (üye olmayan) yorumlarına izin ver
        </label>
      </div>

      {state.error && <p className="text-xs text-status-red-fg">{state.error}</p>}
      {state !== initialState && !state.error && !pending && (
        <p className="text-xs text-status-green-fg">Kaydedildi.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
      >
        {pending ? "Kaydediliyor..." : "Kaydet"}
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
