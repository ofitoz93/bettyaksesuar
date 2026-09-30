"use client";

import { useActionState } from "react";
import { updateStoreLocale, refreshExchangeRate, type ActionState } from "@/app/admin/actions";
import type { StoreSettings } from "@/lib/data/storeSettings";

const initialState: ActionState = {};

export default function YerelForm({ settings }: { settings: StoreSettings }) {
  const [state, formAction, pending] = useActionState(updateStoreLocale, initialState);
  const [rateState, refreshAction, refreshPending] = useActionState(
    async () => refreshExchangeRate(),
    initialState,
  );

  return (
    <div className="flex max-w-lg flex-col gap-10">
      <form action={formAction} className="flex flex-col gap-5">
        <Field label="Ülke">
          <input
            name="localeCountry"
            required
            defaultValue={settings.localeCountry}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Bölge">
            <input
              name="localeRegion"
              defaultValue={settings.localeRegion ?? ""}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="Şehir">
            <input
              name="localeCity"
              defaultValue={settings.localeCity ?? ""}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Para Birimi Kodu">
            <input
              name="currencyCode"
              required
              defaultValue={settings.currencyCode}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="Para Birimi Simgesi">
            <input
              name="currencySymbol"
              required
              defaultValue={settings.currencySymbol}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
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

      <div className="border-t border-line pt-6">
        <h2 className="mb-1 text-sm font-medium">Döviz Kuru (USD/TRY)</h2>
        <p className="mb-3 text-xs text-ink-soft">
          Güncel kur:{" "}
          <span className="text-ink">{settings.currencyExchangeRate.toFixed(4)}</span>
          {settings.currencyUpdatedAt && (
            <span className="text-ink-faint">
              {" "}
              ({new Date(settings.currencyUpdatedAt).toLocaleString("tr-TR")} itibarıyla)
            </span>
          )}
        </p>
        <form action={refreshAction}>
          <button
            type="submit"
            disabled={refreshPending}
            className="border border-ink px-6 py-3 text-xs font-medium tracking-[0.14em] uppercase hover:bg-ivory-deep disabled:opacity-50"
          >
            {refreshPending ? "Güncelleniyor..." : "TCMB'den Kuru Güncelle"}
          </button>
        </form>
        {rateState.error && <p className="mt-2 text-xs text-status-red-fg">{rateState.error}</p>}
      </div>
    </div>
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
