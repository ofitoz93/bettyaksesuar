"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/admin/actions";
import type { ContentPage } from "@/lib/data/contentPages";

const initialState: ActionState = {};

export default function ContentPageForm({
  action,
  page,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  page: ContentPage;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <div>
        <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">Başlık</label>
        <input
          name="title"
          required
          defaultValue={page.title}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">Metin</label>
        <textarea
          name="body"
          rows={16}
          defaultValue={page.body}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm leading-relaxed outline-none focus:border-ink"
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
