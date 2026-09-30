"use client";

import { useActionState } from "react";
import Image from "next/image";
import { updateStoreIdentity, type ActionState } from "@/app/admin/actions";
import type { StoreSettings } from "@/lib/data/storeSettings";

const initialState: ActionState = {};

export default function MagazaForm({
  settings,
  logoUrl,
}: {
  settings: StoreSettings;
  logoUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateStoreIdentity, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <Field label="Mağaza Adı">
        <input
          name="storeName"
          required
          defaultValue={settings.storeName}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>
      <Field label="Mağaza Sahibi">
        <input
          name="storeOwner"
          defaultValue={settings.storeOwner ?? ""}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>
      <Field label="Adres">
        <textarea
          name="storeAddress"
          rows={3}
          defaultValue={settings.storeAddress ?? ""}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="E-posta">
          <input
            name="storeEmail"
            type="email"
            defaultValue={settings.storeEmail ?? ""}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>
        <Field label="Telefon">
          <input
            name="storePhone"
            defaultValue={settings.storePhone ?? ""}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>
      </div>

      <div>
        {logoUrl && (
          <div className="relative mb-3 h-12 w-40 overflow-hidden">
            <Image src={logoUrl} alt="" fill sizes="160px" className="object-contain" />
          </div>
        )}
        <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">
          Mağaza Logosu (bilgisayardan seçin)
        </label>
        <input
          name="logo"
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
