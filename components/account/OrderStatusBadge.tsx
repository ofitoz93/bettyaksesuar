import { ORDER_STATUS_TONE, statusLabel } from "@/lib/orders";

export default function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[10px] tracking-wide whitespace-nowrap uppercase ${
        ORDER_STATUS_TONE[status] ?? "bg-ivory-deep text-ink-soft"
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}
