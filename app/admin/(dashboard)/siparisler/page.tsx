import { getAllOrdersForAdmin } from "@/lib/data/orders";
import { paymentLabel } from "@/lib/orders";
import OrderFulfillmentForm from "./OrderFulfillmentForm";

export default async function AdminSiparislerPage() {
  const orders = await getAllOrdersForAdmin();

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Siparişler</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-ink-soft">Henüz sipariş yok.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-line bg-white p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm">{order.orderNumber}</div>
                  <div className="text-xs text-ink-faint">
                    {new Date(order.createdAt).toLocaleString("tr-TR")}
                  </div>
                </div>
                <OrderFulfillmentForm
                  orderId={order.id}
                  status={order.status}
                  shippingCarrier={order.shippingCarrier}
                  trackingNumber={order.trackingNumber}
                />
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 border-y border-line py-4 text-xs sm:grid-cols-2">
                <div>
                  <div className="mb-1 tracking-wide text-ink-faint uppercase">Müşteri</div>
                  <div className="text-sm text-ink">{order.guestName}</div>
                  <div className="text-ink-soft">{order.guestEmail}</div>
                  <div className="text-ink-soft">{order.guestPhone}</div>
                </div>
                <div>
                  <div className="mb-1 tracking-wide text-ink-faint uppercase">
                    Teslimat Adresi
                  </div>
                  <div className="text-ink-soft">{order.shippingAddress}</div>
                  <div className="mt-1 text-ink-soft">{paymentLabel(order.paymentMethod)}</div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                {order.items.map((item) => (
                  <div
                    key={item.product_slug + item.quantity}
                    className="flex justify-between text-xs text-ink-soft"
                  >
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span>₺{item.line_total}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap justify-between gap-2 border-t border-line pt-3 text-sm">
                <span className="text-ink-soft">
                  Ara toplam ₺{order.subtotal} + Kargo ₺{order.shippingFee}
                </span>
                <span>Toplam ₺{order.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
