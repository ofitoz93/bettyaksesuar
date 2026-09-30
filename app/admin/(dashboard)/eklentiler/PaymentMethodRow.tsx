"use client";

import { useActionState } from "react";
import { updatePaymentMethod, type ActionState } from "@/app/admin/actions";
import type { PaymentMethod } from "@/lib/data/paymentMethods";

const initialState: ActionState = {};

export default function PaymentMethodRow({ method }: { method: PaymentMethod }) {
  const action = updatePaymentMethod.bind(null, method.code);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 border-b border-line p-5 sm:grid-cols-[auto_1fr_auto_auto]">
      <label className="flex items-center gap-2.5 text-sm">
        <input type="checkbox" name="enabled" defaultChecked={method.enabled} className="h-4 w-4" />
        Aktif
      </label>

      <input
        name="label"
        defaultValue={method.label}
        className="w-full border border-line bg-white px-3.5 py-2 text-sm outline-none focus:border-ink"
      />

      <div className="flex items-center gap-2 text-sm">
        <input
          name="extraDiscountPercent"
          type="number"
          min="0"
          max="100"
          step="0.5"
          defaultValue={method.extraDiscountPercent}
          className="w-20 border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink"
        />
        <span className="text-xs text-ink-soft">% ek indirim</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-ink px-5 py-2 text-xs font-medium tracking-wide text-ivory uppercase hover:bg-gold-deep disabled:opacity-50"
        >
          {pending ? "..." : "Kaydet"}
        </button>
        {state.error && <span className="text-xs text-status-red-fg">{state.error}</span>}
      </div>
    </form>
  );
}
