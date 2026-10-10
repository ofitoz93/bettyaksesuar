import Link from "next/link";
import { notFound } from "next/navigation";
import { formatOrderAddress, getMyOrderById } from "@/lib/data/orders";
import { getMyReturnRequests } from "@/lib/data/returns";
import { formatPrice, paymentLabel, paymentStatusLabel } from "@/lib/orders";
import { getTrackingUrl } from "@/lib/shippingCarriers";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import ReturnRequestButton from "../ReturnRequestButton";
import CancelOrderButton from "../CancelOrderButton";

export const metadata = { title: "Sipariş Detayı | Betty Aksesuar" };

// Müşterinin göreceği ilerleme adımları (iptal ayrı gösterilir)
const STEPS = [
  { status: "beklemede", label: "Sipariş Alındı" },
  { status: "onaylandi", label: "Hazırlanıyor" },
  { status: "kargoda", label: "Kargoda" },
  { status: "teslim_edildi", label: "Teslim Edildi" },
];

export default async function SiparisDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, returnRequests] = await Promise.all([getMyOrderById(id), getMyReturnRequests()]);

  if (!order) notFound();

  const returnStatus = returnRequests.find((r) => r.orderId === order.id)?.status ?? null;
  const trackingUrl = getTrackingUrl(order.shippingCarrier, order.trackingNumber);
  const currentStep = STEPS.findIndex((s) => s.status === order.status);

  return (
    <div>
      <Link href="/hesabim/siparislerim" className="mb-4 inline-block text-xs text-ink-soft hover:text-ink">
        ← Siparişlerim
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <h1 className="font-display text-[26px] break-all">{order.orderNumber}</h1>
          <p className="mt-1 text-xs text-ink-soft">
            {new Date(order.createdAt).toLocaleString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.status === "iptal" ? (
        <div className="mb-8 border border-status-red-bg bg-status-red-bg px-5 py-4 text-sm text-status-red-fg">
          Bu sipariş iptal edildi.
        </div>
      ) : (
        <ol className="mb-8 grid grid-cols-4 gap-1">
          {STEPS.map((step, i) => {
            const done = i <= currentStep;
            return (
              <li key={step.status} className="text-center">
                <div className={`mb-2 h-1 ${done ? "bg-gold-deep" : "bg-line"}`} />
                <span className={`text-[10px] tracking-wide uppercase sm:text-[11px] ${done ? "text-ink" : "text-ink-faint"}`}>
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {order.trackingNumber && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-line bg-white px-5 py-4 text-sm">
          <div>
            <div className="text-[10px] tracking-[0.14em] text-ink-soft uppercase">Kargo Takip</div>
            <div className="mt-1">
              {order.shippingCarrier} — {order.trackingNumber}
            </div>
          </div>
          {trackingUrl && (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-ink px-4 py-2 text-xs tracking-wide uppercase hover:bg-ink hover:text-ivory"
            >
              Kargoyu Takip Et
            </a>
          )}
        </div>
      )}

      <div className="mb-6 border border-line bg-white">
        <div className="border-b border-line px-5 py-3 text-[10px] tracking-[0.14em] text-ink-soft uppercase">
          Ürünler
        </div>
        <ul className="divide-y divide-line">
          {order.items.map((item, i) => (
            <li key={`${item.product_slug}-${i}`} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
              <div className="min-w-0">
                <Link href={`/urun/${item.product_slug}`} className="hover:text-gold-deep">
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
        <div className="flex flex-col gap-1.5 border-t border-line px-5 py-4 text-sm">
          <Row label="Ara Toplam" value={formatPrice(order.subtotal)} />
          <Row label="Kargo" value={order.shippingFee === 0 ? "Ücretsiz" : formatPrice(order.shippingFee)} />
          {order.discountAmount > 0 && (
            <Row
              label={`İndirim kodu${order.discountCode ? ` (${order.discountCode})` : ""}`}
              value={`-${formatPrice(order.discountAmount)}`}
              tone="green"
            />
          )}
          {order.paymentDiscountAmount > 0 && (
            <Row
              label={`Ödeme yöntemi indirimi (%${order.paymentDiscountPercent})`}
              value={`-${formatPrice(order.paymentDiscountAmount)}`}
              tone="green"
            />
          )}
          <div className="mt-1.5 flex justify-between border-t border-line pt-2.5">
            <span>Toplam</span>
            <span className="font-medium">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoBox title="Teslimat Adresi">
          <div className="text-ink">{order.guestName}</div>
          <div>{formatOrderAddress(order)}</div>
          <div className="mt-1">{order.guestPhone}</div>
        </InfoBox>
        <InfoBox title="Ödeme">
          <div className="text-ink">{paymentLabel(order.paymentMethod)}</div>
          {order.paymentMethod === "kredi_karti" && <div>{paymentStatusLabel(order.paymentStatus)}</div>}
          <div className="mt-2 text-[10px] tracking-[0.14em] text-ink-soft uppercase">Fatura Adresi</div>
          <div>{order.billingAddress || "Teslimat adresiyle aynı"}</div>
        </InfoBox>
      </div>

      {order.status === "beklemede" && <CancelOrderButton orderId={order.id} />}
      {order.status === "teslim_edildi" && (
        <ReturnRequestButton orderId={order.id} existingStatus={returnStatus} />
      )}
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "green" }) {
  return (
    <div className={`flex justify-between ${tone === "green" ? "text-status-green-fg" : ""}`}>
      <span className={tone ? "" : "text-ink-soft"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-line bg-white px-5 py-4 text-xs leading-relaxed text-ink-soft">
      <div className="mb-2 text-[10px] tracking-[0.14em] uppercase">{title}</div>
      {children}
    </div>
  );
}
