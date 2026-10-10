import Link from "next/link";
import { notFound } from "next/navigation";
import { formatOrderAddress, getOrderEvents, getOrderForAdmin } from "@/lib/data/orders";
import {
  PAYMENT_STATUS_TONE,
  formatPrice,
  paymentLabel,
  paymentStatusLabel,
  statusLabel,
} from "@/lib/orders";
import { getTrackingUrl } from "@/lib/shippingCarriers";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import OrderFulfillmentForm from "../OrderFulfillmentForm";
import OrderNoteForm from "./OrderNoteForm";
import type { OrderEvent } from "@/lib/data/orders";

export default async function AdminSiparisDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, events] = await Promise.all([getOrderForAdmin(id), getOrderEvents(id)]);

  if (!order) notFound();

  const trackingUrl = getTrackingUrl(order.shippingCarrier, order.trackingNumber);
  const whatsappPhone = order.guestPhone.replace(/\D/g, "").replace(/^0/, "90");

  return (
    <div>
      <Link href="/admin/siparisler" className="mb-4 inline-block text-xs text-ink-soft hover:text-ink">
        ← Siparişler
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] break-all">{order.orderNumber}</h1>
          <p className="text-xs text-ink-soft">
            {new Date(order.createdAt).toLocaleString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          {order.paymentMethod === "kredi_karti" && (
            <span
              className={`px-2.5 py-1 text-[10px] tracking-wide uppercase ${
                PAYMENT_STATUS_TONE[order.paymentStatus] ?? ""
              }`}
            >
              {paymentStatusLabel(order.paymentStatus)}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card title="Ürünler">
            <ul className="divide-y divide-line">
              {order.items.map((item, i) => (
                <li key={`${item.product_slug}-${i}`} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div className="min-w-0">
                    <Link href={`/urun/${item.product_slug}`} target="_blank" className="hover:text-gold-deep">
                      {item.product_name}
                    </Link>
                    <div className="text-xs text-ink-faint">
                      {item.quantity} × {formatPrice(Number(item.unit_price))}
                    </div>
                  </div>
                  <span className="shrink-0">{formatPrice(Number(item.line_total))}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Ödeme Özeti">
            <div className="flex flex-col gap-1.5 text-sm">
              <Row label="Ara toplam" value={formatPrice(order.subtotal)} />
              <Row label="Kargo" value={order.shippingFee === 0 ? "Ücretsiz" : formatPrice(order.shippingFee)} />
              {order.discountAmount > 0 && (
                <Row
                  label={`İndirim kodu${order.discountCode ? ` (${order.discountCode})` : ""}`}
                  value={`-${formatPrice(order.discountAmount)}`}
                />
              )}
              {order.paymentDiscountAmount > 0 && (
                <Row
                  label={`Ödeme yöntemi indirimi (%${order.paymentDiscountPercent})`}
                  value={`-${formatPrice(order.paymentDiscountAmount)}`}
                />
              )}
              <div className="mt-1 flex justify-between border-t border-line pt-2.5 font-medium">
                <span>Toplam</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="mt-1 text-xs text-ink-soft">{paymentLabel(order.paymentMethod)}</div>
            </div>
          </Card>

          <Card title="Durum ve Kargo">
            <OrderFulfillmentForm
              orderId={order.id}
              status={order.status}
              shippingCarrier={order.shippingCarrier}
              trackingNumber={order.trackingNumber}
            />
            {trackingUrl && (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs text-gold-deep underline"
              >
                Kargoyu takip et ↗
              </a>
            )}
          </Card>

          <Card title="Notlar ve Geçmiş">
            <OrderNoteForm orderId={order.id} />
            <Timeline events={events} />
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card title="Müşteri">
            <div className="text-sm">
              {order.customerId ? (
                <Link href={`/admin/musteriler/${order.customerId}`} className="hover:text-gold-deep">
                  {order.guestName} →
                </Link>
              ) : (
                <>
                  {order.guestName}
                  <span className="ml-2 bg-ivory-deep px-1.5 py-0.5 text-[10px] text-ink-soft uppercase">
                    Misafir
                  </span>
                </>
              )}
            </div>
            <div className="mt-2 flex flex-col gap-1 text-xs">
              <a href={`mailto:${order.guestEmail}`} className="break-all text-ink-soft hover:text-ink">
                {order.guestEmail}
              </a>
              <a href={`tel:${order.guestPhone}`} className="text-ink-soft hover:text-ink">
                {order.guestPhone}
              </a>
              {whatsappPhone && (
                <a
                  href={`https://wa.me/${whatsappPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-status-green-fg hover:underline"
                >
                  WhatsApp&apos;tan yaz ↗
                </a>
              )}
            </div>
          </Card>

          <Card title="Teslimat Adresi">
            <p className="text-xs leading-relaxed text-ink-soft">
              <span className="text-ink">{order.guestName}</span>
              <br />
              {formatOrderAddress(order)}
            </p>
          </Card>

          <Card title="Fatura Adresi">
            <p className="text-xs leading-relaxed text-ink-soft">
              {order.billingAddress || "Teslimat adresiyle aynı"}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-white px-5 py-4">
      <h2 className="mb-3 text-[11px] tracking-[0.14em] text-ink-soft uppercase">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-ink-soft">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function describeEvent(event: OrderEvent): string {
  switch (event.kind) {
    case "created":
      return "Sipariş oluşturuldu";
    case "status":
      return `Durum değişti: ${statusLabel(event.fromValue ?? "")} → ${statusLabel(event.toValue ?? "")}`;
    case "payment":
      return `Ödeme durumu: ${paymentStatusLabel(event.fromValue ?? "")} → ${paymentStatusLabel(event.toValue ?? "")}`;
    case "tracking":
      return `Kargo bilgisi girildi: ${event.message ?? ""}`;
    default:
      return event.message ?? "";
  }
}

function Timeline({ events }: { events: OrderEvent[] }) {
  if (events.length === 0) {
    return <p className="mt-4 text-xs text-ink-faint">Henüz kayıt yok.</p>;
  }

  return (
    <ol className="mt-5 flex flex-col gap-4 border-l border-line pl-4">
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span
            className={`absolute top-1.5 -left-[21px] h-2 w-2 rounded-full ${
              event.kind === "note" ? "bg-gold-deep" : "bg-ink-faint"
            }`}
          />
          <div
            className={`text-sm whitespace-pre-line ${
              event.kind === "note" ? "border border-line bg-ivory px-3 py-2" : ""
            }`}
          >
            {describeEvent(event)}
          </div>
          <div className="mt-0.5 text-[11px] text-ink-faint">
            {event.kind === "note" && "Not · "}
            {new Date(event.createdAt).toLocaleString("tr-TR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </li>
      ))}
    </ol>
  );
}
