"use client";

import { useActionState } from "react";
import { updateWhatsAppSettings, type ActionState } from "@/app/admin/actions";
import type { StoreSettings } from "@/lib/data/storeSettings";

const initialState: ActionState = {};

export default function WhatsAppForm({ settings }: { settings: StoreSettings }) {
  const [state, formAction, pending] = useActionState(updateWhatsAppSettings, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="whatsappEnabled"
          defaultChecked={settings.whatsappEnabled}
          className="h-4 w-4"
        />
        WhatsApp sipariş butonunu etkinleştir
      </label>

      <Field label="WhatsApp Numarası (ülke koduyla, örn. 905XXXXXXXXX)">
        <input
          name="whatsappPhone"
          defaultValue={settings.whatsappPhone ?? ""}
          placeholder="905XXXXXXXXX"
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <Field label="Genel Sayfalarda Gönderilecek Mesaj (ana sayfa vb.)">
        <textarea
          name="whatsappDefaultMessage"
          rows={2}
          defaultValue={settings.whatsappDefaultMessage}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <Field label="Ürün Sayfasında Gönderilecek Mesaj">
        <textarea
          name="whatsappProductMessage"
          rows={2}
          defaultValue={settings.whatsappProductMessage}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
        <p className="mt-1.5 text-xs text-ink-faint">
          <code>{"{urun_adi}"}</code> ve <code>{"{urun_linki}"}</code> yazdığınız yerler, hangi
          üründen tıklandıysa o ürünün adı ve bağlantısıyla otomatik değiştirilir.
        </p>
      </Field>

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
