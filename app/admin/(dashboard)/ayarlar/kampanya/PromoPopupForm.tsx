"use client";

import { useActionState } from "react";
import Image from "next/image";
import { updatePromoPopupSettings, type ActionState } from "@/app/admin/actions";
import type { PromoPopupSettings } from "@/lib/data/promoPopup";

const initialState: ActionState = {};

export default function PromoPopupForm({ settings }: { settings: PromoPopupSettings }) {
  const [state, formAction, pending] = useActionState(updatePromoPopupSettings, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex items-center gap-2.5 text-sm">
        <input type="checkbox" name="enabled" defaultChecked={settings.enabled} className="h-4 w-4" />
        Popup aktif
      </label>

      <Field label="Kaç saniye sonra gösterilsin">
        <input
          name="delaySeconds"
          type="number"
          min="3"
          required
          defaultValue={settings.delaySeconds}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <Field label="Başlık">
        <input
          name="title"
          required
          defaultValue={settings.title}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <Field label="Metin">
        <textarea
          name="body"
          required
          rows={3}
          defaultValue={settings.body}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Buton Metni">
          <input
            name="buttonLabel"
            required
            defaultValue={settings.buttonLabel}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>
        <Field label="İndirim Kodu">
          <input
            name="discountCode"
            required
            defaultValue={settings.discountCode}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>
      </div>

      <Field label="İndirim Yüzdesi (yalnızca üye olup ilk siparişini veren müşteriye uygulanır)">
        <input
          name="discountPercent"
          type="number"
          min="0"
          max="90"
          step="1"
          required
          defaultValue={settings.discountPercent}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <div>
        {settings.imageUrl && (
          <div className="relative mb-3 h-32 w-32 overflow-hidden border border-line">
            <Image src={settings.imageUrl} alt="" fill sizes="128px" className="object-cover" />
          </div>
        )}
        <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">
          Kart Görseli (opsiyonel)
        </label>
        <input
          name="image"
          type="file"
          accept="image/*"
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">{label}</label>
      {children}
    </div>
  );
}
