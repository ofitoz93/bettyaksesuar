"use client";

import { useActionState } from "react";
import { requestStockNotification, type StockNotifyState } from "@/app/urun/actions";

const initialState: StockNotifyState = {};

export default function StockNotifyForm({
  productId,
  productName,
  productSlug,
  userEmail,
}: {
  productId: string;
  productName: string;
  productSlug: string;
  userEmail?: string | null;
}) {
  const [state, formAction, pending] = useActionState(requestStockNotification, initialState);

  if (state.info) {
    return <p className="mt-3.5 text-xs text-gold-deep">{state.info}</p>;
  }

  return (
    <form action={formAction} className="mt-3.5 flex flex-wrap items-start gap-2.5">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productName" value={productName} />
      <input type="hidden" name="productSlug" value={productSlug} />

      {userEmail ? (
        <input type="hidden" name="email" value={userEmail} />
      ) : (
        <input
          type="email"
          name="email"
          required
          placeholder="E-posta adresiniz"
          className="w-full max-w-[220px] border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      )}

      <button
        type="submit"
        disabled={pending}
        className="border border-ink px-6 py-2.5 text-xs font-medium tracking-[0.14em] uppercase transition-colors hover:bg-ink hover:text-ivory disabled:opacity-50"
      >
        {pending ? "Gönderiliyor..." : "Stoğa Gelince Haber Ver"}
      </button>

      {state.error && <p className="w-full text-xs text-status-red-fg">{state.error}</p>}
    </form>
  );
}
