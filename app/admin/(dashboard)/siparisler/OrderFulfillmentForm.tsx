"use client";

import { useActionState } from "react";
import { updateOrderFulfillment, type ActionState } from "@/app/admin/actions";
import { ORDER_STATUSES, statusLabel } from "@/lib/orders";
import { SHIPPING_CARRIERS } from "@/lib/shippingCarriers";

const initialState: ActionState = {};

const STATUS_TONE: Record<string, string> = {
  beklemede: "bg-status-amber-bg text-status-amber-fg",
  onaylandi: "bg-status-blue-bg text-status-blue-fg",
  kargoda: "bg-status-blue-bg text-status-blue-fg",
  teslim_edildi: "bg-status-green-bg text-status-green-fg",
  iptal: "bg-status-red-bg text-status-red-fg",
};

export default function OrderFulfillmentForm({
  orderId,
  status,
  shippingCarrier,
  trackingNumber,
}: {
  orderId: string;
  status: string;
  shippingCarrier: string | null;
  trackingNumber: string | null;
}) {
  const updateWithId = updateOrderFulfillment.bind(null, orderId);
  const [state, formAction, pending] = useActionState(updateWithId, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-[10px] tracking-wide text-ink-faint uppercase">
          Durum
        </label>
        <select
          name="status"
          defaultValue={status}
          className={`border-0 px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase outline-none ${
            STATUS_TONE[status] ?? ""
          }`}
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-[10px] tracking-wide text-ink-faint uppercase">
          Kargo Firması
        </label>
        <select
          name="shippingCarrier"
          defaultValue={shippingCarrier ?? ""}
          className="border border-line px-2.5 py-1.5 text-xs outline-none focus:border-ink"
        >
          <option value="">—</option>
          {SHIPPING_CARRIERS.map((carrier) => (
            <option key={carrier} value={carrier}>
              {carrier}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-[10px] tracking-wide text-ink-faint uppercase">
          Takip No
        </label>
        <input
          name="trackingNumber"
          defaultValue={trackingNumber ?? ""}
          placeholder="Takip numarası"
          className="w-36 border border-line px-2.5 py-1.5 text-xs outline-none focus:border-ink"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-ink px-4 py-1.5 text-[11px] font-medium tracking-[0.1em] text-ivory uppercase hover:bg-gold-deep disabled:opacity-50"
      >
        {pending ? "..." : "Kaydet"}
      </button>

      {state.error && <p className="w-full text-xs text-status-red-fg">{state.error}</p>}
    </form>
  );
}
