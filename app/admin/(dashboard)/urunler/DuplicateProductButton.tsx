"use client";

import { duplicateProduct } from "@/app/admin/actions";

export default function DuplicateProductButton({ id }: { id: string }) {
  return (
    <button
      type="button"
      onClick={() => duplicateProduct(id)}
      className="text-xs tracking-wide text-ink-soft hover:text-ink"
    >
      Kopyala
    </button>
  );
}
