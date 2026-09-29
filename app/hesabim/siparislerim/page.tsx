import Link from "next/link";
import { getMyOrders } from "@/lib/data/orders";
import { getMyReturnRequests } from "@/lib/data/returns";
import { statusLabel, paymentLabel } from "@/lib/orders";
import { getTrackingUrl } from "@/lib/shippingCarriers";
import ReturnRequestButton from "./ReturnRequestButton";

const STATUS_TONE: Record<string, string> = {
  beklemede: "bg-status-amber-bg text-status-amber-fg",
  onaylandi: "bg-status-blue-bg text-status-blue-fg",
  kargoda: "bg-status-blue-bg text-status-blue-fg",
  teslim_edildi: "bg-status-green-bg text-status-green-fg",
  iptal: "bg-status-red-bg text-status-red-fg",
};

export default async function SiparislerimPage() {
  const [orders, returnRequests] = await Promise.all([getMyOrders(), getMyReturnRequests()]);
  const returnStatusByOrderId = new Map(returnRequests.map((r) => [r.orderId, r.status]));

  return (
    <div>
      <div className="mb-10 text-center">
        <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
          HESABIM
        </div>
        <h1 className="font-display mt-2.5 text-[28px]">Siparişlerim</h1>
      </div>

      <Link href="/hesabim" className="mb-6 inline-block text-xs text-ink-soft hover:text-ink">
        ← Hesabım
      </Link>

      {orders.length === 0 ? (
        <p className="text-center text-sm text-ink-soft">Henüz siparişiniz yok.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const trackingUrl = getTrackingUrl(order.shippingCarrier, order.trackingNumber);

            return (
              <div key={order.id} className="border border-line p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm">{order.orderNumber}</div>
                    <div className="text-xs text-ink-faint">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")} ·{" "}
                      {paymentLabel(order.paymentMethod)}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-[10px] tracking-wide uppercase ${STATUS_TONE[order.status] ?? ""}`}
                  >
                    {statusLabel(order.status)}
                  </span>
                </div>

                {order.trackingNumber && (
                  <div className="mb-3 text-xs text-ink-soft">
                    Kargo: {order.shippingCarrier} — {order.trackingNumber}
                    {trackingUrl && (
                      <a
                        href={trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-gold-deep underline"
                      >
                        Kargoyu Takip Et
                      </a>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-1 border-t border-line pt-3">
                  {order.items.map((item) => (
                    <div key={item.product_slug + item.quantity} className="flex justify-between text-xs text-ink-soft">
                      <span>
                        {item.product_name} × {item.quantity}
                      </span>
                      <span>₺{item.line_total}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-between border-t border-line pt-3 text-sm">
                  <span>Toplam</span>
                  <span>₺{order.total}</span>
                </div>

                {order.status === "teslim_edildi" && (
                  <ReturnRequestButton
                    orderId={order.id}
                    existingStatus={returnStatusByOrderId.get(order.id) ?? null}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
