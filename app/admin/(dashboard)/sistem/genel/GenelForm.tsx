"use client";

import { useActionState } from "react";
import { updateStoreMeta, type ActionState } from "@/app/admin/actions";
import type { StoreSettings } from "@/lib/data/storeSettings";

const initialState: ActionState = {};

export default function GenelForm({ settings }: { settings: StoreSettings }) {
  const [state, formAction, pending] = useActionState(updateStoreMeta, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <Field label="Meta Başlık">
        <input
          name="metaTitle"
          required
          defaultValue={settings.metaTitle}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>
      <Field label="Meta Açıklama">
        <textarea
          name="metaDescription"
          rows={3}
          defaultValue={settings.metaDescription ?? ""}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>
      <Field label="Meta Anahtar Kelimeler (virgülle ayırın)">
        <input
          name="metaKeywords"
          defaultValue={settings.metaKeywords ?? ""}
          placeholder="takı, kolye, gümüş bileklik"
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
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
