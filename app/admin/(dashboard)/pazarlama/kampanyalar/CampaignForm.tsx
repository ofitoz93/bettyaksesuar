"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/admin/actions";
import type { Campaign } from "@/lib/data/campaigns";

const initialState: ActionState = {};

export default function CampaignForm({
  action,
  campaign,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  campaign?: Campaign;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      <Field label="Kampanya Kodu (müşterinin gireceği kod)">
        <input
          name="code"
          required
          defaultValue={campaign?.code}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm uppercase outline-none focus:border-ink"
        />
      </Field>

      <Field label="Başlık (panelde görünür)">
        <input
          name="title"
          required
          defaultValue={campaign?.title}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <Field label="Açıklama (opsiyonel)">
        <textarea
          name="description"
          rows={2}
          defaultValue={campaign?.description ?? ""}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <Field label="İndirim Yüzdesi (%)">
        <input
          name="discountPercent"
          type="number"
          min="1"
          max="90"
          step="1"
          required
          defaultValue={campaign?.discountPercent}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={campaign?.enabled ?? true}
          className="h-4 w-4"
        />
        Kampanya aktif
      </label>

      <p className="text-xs text-ink-soft">
        Her müşteri bu kampanya kodunu en fazla 1 kez kullanabilir; kodu kullanmak için üye
        girişi yapmış olmak gerekir.
      </p>

      {state.error && <p className="text-xs text-status-red-fg">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-fit bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
      >
        {pending ? "Kaydediliyor..." : submitLabel}
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
