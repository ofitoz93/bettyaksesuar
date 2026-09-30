"use client";

import { useActionState } from "react";
import { updateEmailSettings, type ActionState } from "@/app/admin/actions";
import type { NotificationSettings } from "@/lib/data/notificationSettings";

const initialState: ActionState = {};

export default function EpostaForm({ settings }: { settings: NotificationSettings }) {
  const [state, formAction, pending] = useActionState(updateEmailSettings, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <p className="text-xs text-ink-soft">
        SMTP bilgileri girilirse e-postalar bunlar üzerinden gönderilir; boş bırakılırsa
        (varsa) Resend API üzerinden gönderilmeye devam edilir.
      </p>
      <Field label="SMTP Host">
        <input
          name="smtpHost"
          placeholder="smtp.gmail.com"
          defaultValue={settings.smtpHost ?? ""}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>
      <Field label="SMTP Kullanıcı Adı">
        <input
          name="smtpUsername"
          defaultValue={settings.smtpUsername ?? ""}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>
      <Field label="SMTP Parola (değiştirmek istemiyorsanız boş bırakın)">
        <input
          name="smtpPassword"
          type="password"
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="SMTP Port">
          <input
            name="smtpPort"
            type="number"
            defaultValue={settings.smtpPort ?? ""}
            placeholder="587"
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>
        <Field label="Zaman Aşımı (saniye)">
          <input
            name="smtpTimeout"
            type="number"
            defaultValue={settings.smtpTimeout}
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
