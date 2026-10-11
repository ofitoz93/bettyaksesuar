"use client";

import { useTransition } from "react";
import { deleteExpense } from "@/app/admin/finance-actions";

export default function DeleteExpenseButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Bu gider silinsin mi?")) return;
        startTransition(async () => {
          const result = await deleteExpense(id);
          if (result.error) alert(result.error);
        });
      }}
      className="shrink-0 px-2 py-1 text-xs text-ink-faint hover:text-status-red-fg disabled:opacity-40"
      aria-label="Gideri sil"
    >
      {pending ? "..." : "Sil"}
    </button>
  );
}
