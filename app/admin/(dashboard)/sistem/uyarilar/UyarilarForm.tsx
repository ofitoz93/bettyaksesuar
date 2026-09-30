"use client";

import { useActionState } from "react";
import { updateAlertSettings, type ActionState } from "@/app/admin/actions";
import type { NotificationSettings } from "@/lib/data/notificationSettings";

const initialState: ActionState = {};

export default function UyarilarForm({ settings }: { settings: NotificationSettings }) {
  const [state, formAction, pending] = useActionState(updateAlertSettings, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="alertNewCustomer"
          defaultChecked={settings.alertNewCustomer}
          className="h-4 w-4"
        />
        Yeni müşteri kaydında bildirim e-postası gönder
      </label>
      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="alertNewOrder"
          defaultChecked={settings.alertNewOrder}
          className="h-4 w-4"
        />
        Yeni siparişte bildirim e-postası gönder
      </label>
      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="alertNewReview"
          defaultChecked={settings.alertNewReview}
          className="h-4 w-4"
        />
        Yeni yorum/değerlendirmede bildirim e-postası gönder
      </label>

      <div className="mt-2">
        <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">
          İlave Uyarı E-postası (opsiyonel)
        </label>
        <input
          name="alertExtraEmail"
          type="email"
          defaultValue={settings.alertExtraEmail ?? ""}
          placeholder="ornek@sirket.com"
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
        className="w-fit bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
      >
        {pending ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}
