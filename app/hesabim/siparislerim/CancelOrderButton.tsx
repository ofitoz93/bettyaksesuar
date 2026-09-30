"use client";

import { useState } from "react";
import { cancelMyOrder } from "@/app/hesabim/actions";

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          if (!confirm("Bu siparişi iptal etmek istediğinize emin misiniz?")) return;
          setPending(true);
          const result = await cancelMyOrder(orderId);
          setPending(false);
          if (result.error) setError(result.error);
        }}
        className="border border-status-red-fg px-4 py-2 text-xs tracking-wide text-status-red-fg hover:bg-status-red-bg disabled:opacity-50"
      >
        {pending ? "İptal Ediliyor..." : "Siparişi İptal Et"}
      </button>
      {error && <p className="mt-1.5 text-xs text-status-red-fg">{error}</p>}
    </div>
  );
}
