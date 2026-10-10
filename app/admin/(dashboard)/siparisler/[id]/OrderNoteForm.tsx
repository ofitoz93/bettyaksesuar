"use client";

import { useActionState, useRef } from "react";
import { addOrderNote, type ActionState } from "@/app/admin/actions";

const initialState: ActionState = {};

export default function OrderNoteForm({ orderId }: { orderId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await addOrderNote(orderId, prev, formData);
      if (!result.error) formRef.current?.reset();
      return result;
    },
    initialState,
  );

  return (
    <form ref={formRef} action={formAction}>
      <textarea
        name="note"
        rows={2}
        required
        placeholder="Siparişe not ekleyin (yalnızca yöneticiler görür)..."
        className="w-full border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-ink px-4 py-1.5 text-[11px] font-medium tracking-[0.1em] text-ivory uppercase hover:bg-gold-deep disabled:opacity-50"
        >
          {pending ? "..." : "Not Ekle"}
        </button>
        {state.error && <span className="text-xs text-status-red-fg">{state.error}</span>}
      </div>
    </form>
  );
}
