"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/admin/actions";
import type { TestimonialRow } from "@/lib/data/testimonials";

const initialState: ActionState = {};

interface TestimonialFormProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  testimonial?: TestimonialRow;
  submitLabel: string;
}

export default function TestimonialForm({
  action,
  testimonial,
  submitLabel,
}: TestimonialFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      <Field label="İsim">
        <input
          name="author"
          required
          defaultValue={testimonial?.author}
          placeholder="Elif K."
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <Field label="Yorum">
        <textarea
          name="quote"
          required
          rows={4}
          defaultValue={testimonial?.quote}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <div className="grid grid-cols-2 gap-5">
        <Field label="Puan (1-5)">
          <input
            name="rating"
            type="number"
            min="1"
            max="5"
            required
            defaultValue={testimonial?.rating ?? 5}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>
        <Field label="Sıra (küçük sayı önce gösterilir)">
          <input
            name="position"
            type="number"
            min="0"
            defaultValue={testimonial?.position ?? 0}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>
      </div>

      {state.error && <p className="text-xs text-status-red-fg">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
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
