import Link from "next/link";
import { getMyOrders } from "@/lib/data/orders";
import { formatPrice, paymentLabel } from "@/lib/orders";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";

export const metadata = { title: "Siparişlerim | Betty Aksesuar" };

export default async function SiparislerimPage() {
  const orders = await getMyOrders();

  return (
    <div>
      <div className="mb-6 border-b border-line pb-4">
        <h1 className="font-display text-[28px]">Siparişlerim</h1>
        <p className="mt-1 text-xs text-ink-soft">
          Siparişlerinizin durumunu takip edin, detaylarını görüntüleyin, iptal veya iade talebi
          oluşturun.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="border border-dashed border-line px-6 py-10 text-center">
          <p className="mb-5 text-sm text-ink-soft">Henüz siparişiniz yok.</p>
          <Link
            href="/magaza"
            className="inline-block bg-ink px-8 py-3 text-xs font-medium tracking-[0.14em] text-ivory uppercase hover:bg-gold-deep"
          >
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const preview = order.items.map((item) => item.product_name).join(", ");

            return (
              <li key={order.id}>
                <Link
                  href={`/hesabim/siparislerim/${order.id}`}
                  className="block border border-line bg-white p-5 hover:border-ink"
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-sm break-all">{order.orderNumber}</div>
                      <div className="text-xs text-ink-faint">
                        {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}{" "}
                        · {paymentLabel(order.paymentMethod)}
                      </div>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="truncate text-xs text-ink-soft">{preview}</div>
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm">
                    <span className="text-ink-soft">
                      {itemCount} ürün · <span className="text-ink">{formatPrice(order.total)}</span>
                    </span>
                    <span className="text-xs text-ink-soft">Detaylar →</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
