"use client";

import { useActionState } from "react";
import { addExpense, type ExpenseFormState } from "@/app/admin/finance-actions";
import { EXPENSE_CATEGORIES } from "@/lib/finance";

const initialState: ExpenseFormState = {};
const inputClass = "w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink";

export default function ExpenseForm({ defaultDate }: { defaultDate: string }) {
  const [state, formAction, pending] = useActionState(addExpense, initialState);

  return (
    // Başarılı kayıttan sonra key değişir ve form temizlenir
    <form key={state.savedAt ?? 0} action={formAction} className="flex flex-col gap-4">
      <Field label="Tarih">
        <input name="date" type="date" required defaultValue={defaultDate} className={inputClass} />
      </Field>
      <Field label="Gider türü">
        <select name="category" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Seçin
          </option>
          {Object.entries(EXPENSE_CATEGORIES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Tutar (₺)">
        <input
          name="amount"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          required
          className={inputClass}
        />
      </Field>
      <Field label="Açıklama (opsiyonel)">
        <input name="description" maxLength={300} placeholder="Örn. Instagram reklamı" className={inputClass} />
      </Field>

      {state.error && <p className="text-xs text-status-red-fg">{state.error}</p>}
      {state.success && <p className="text-xs text-status-green-fg">Gider kaydedildi.</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-fit bg-ink px-8 py-3 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
      >
        {pending ? "Kaydediliyor..." : "Gideri Ekle"}
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
