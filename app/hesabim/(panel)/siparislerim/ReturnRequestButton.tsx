"use client";

import { useActionState, useState } from "react";
import { createReturnRequest, type ActionState } from "@/app/admin/actions";
import { returnStatusLabel } from "@/lib/returns";

const initialState: ActionState = {};

export default function ReturnRequestButton({
  orderId,
  existingStatus,
}: {
  orderId: string;
  existingStatus: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createReturnRequest, initialState);

  if (existingStatus) {
    return (
      <div className="mt-3 border-t border-line pt-3 text-xs text-ink-soft">
        İade talebiniz: <span className="text-ink">{returnStatusLabel(existingStatus)}</span>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 border-t border-line pt-3 text-xs text-ink-soft underline hover:text-ink"
      >
        İade Talebi Oluştur
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-3 border-t border-line pt-3">
      <input type="hidden" name="orderId" value={orderId} />
      <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">İade Nedeni</label>
      <textarea
        name="reason"
        rows={3}
        required
        className="w-full border border-line bg-white px-3 py-2 text-xs outline-none focus:border-ink"
      />
      {state.error && <p className="mt-1.5 text-xs text-status-red-fg">{state.error}</p>}
      <div className="mt-2 flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-ink px-5 py-2 text-[11px] tracking-wide text-ivory uppercase hover:bg-gold-deep disabled:opacity-50"
        >
          {pending ? "Gönderiliyor..." : "Talebi Gönder"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[11px] tracking-wide text-ink-soft uppercase hover:text-ink"
        >
          Vazgeç
        </button>
      </div>
    </form>
  );
}
