import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerById } from "@/lib/data/customers";
import { getOrdersForCustomer } from "@/lib/data/orders";
import { getAddressesForCustomer } from "@/lib/data/addresses";
import { formatPrice } from "@/lib/orders";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";

export default async function AdminMusteriDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [customer, orders, addresses] = await Promise.all([
    getCustomerById(id),
    getOrdersForCustomer(id),
    getAddressesForCustomer(id),
  ]);

  if (!customer) notFound();

  const paidOrderCount = orders.filter((o) => o.status !== "iptal").length;
  const averageOrder = paidOrderCount > 0 ? customer.totalSpent / paidOrderCount : 0;
  const whatsappPhone = customer.phone?.replace(/\D/g, "").replace(/^0/, "90");

  return (
    <div>
      <Link href="/admin/musteriler" className="mb-4 inline-block text-xs text-ink-soft hover:text-ink">
        ← Müşteriler
      </Link>

      <div className="mb-6">
        <h1 className="font-display text-[28px]">{customer.fullName || customer.email}</h1>
        <p className="text-xs text-ink-soft">
          Üyelik: {new Date(customer.createdAt).toLocaleDateString("tr-TR")}
          {customer.lastSignInAt &&
            ` · Son giriş: ${new Date(customer.lastSignInAt).toLocaleDateString("tr-TR")}`}
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Sipariş" value={String(customer.orderCount)} />
        <Stat label="Toplam Harcama" value={formatPrice(customer.totalSpent)} />
        <Stat label="Ortalama Sepet" value={formatPrice(Math.round(averageOrder))} />
        <Stat
          label="Son Sipariş"
          value={customer.lastOrderAt ? new Date(customer.lastOrderAt).toLocaleDateString("tr-TR") : "—"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        <section className="min-w-0 border border-line bg-white">
          <h2 className="border-b border-line px-5 py-3 text-[11px] tracking-[0.14em] text-ink-soft uppercase">
            Siparişler
          </h2>
          {orders.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-soft">Bu müşterinin henüz siparişi yok.</p>
          ) : (
            <ul className="divide-y divide-line">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/siparisler/${order.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-ivory"
                  >
                    <div className="min-w-0">
                      <div className="break-all">{order.orderNumber}</div>
                      <div className="text-xs text-ink-faint">
                        {new Date(order.createdAt).toLocaleDateString("tr-TR")} ·{" "}
                        {order.items.reduce((sum, i) => sum + i.quantity, 0)} ürün
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <span className="w-20 text-right">{formatPrice(order.total)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-col gap-4">
          <section className="border border-line bg-white px-5 py-4">
            <h2 className="mb-3 text-[11px] tracking-[0.14em] text-ink-soft uppercase">İletişim</h2>
            <div className="flex flex-col gap-1 text-xs">
              <a href={`mailto:${customer.email}`} className="break-all text-ink-soft hover:text-ink">
                {customer.email}
              </a>
              {customer.phone && (
                <a href={`tel:${customer.phone}`} className="text-ink-soft hover:text-ink">
                  {customer.phone}
                </a>
              )}
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
          </section>

          <section className="border border-line bg-white px-5 py-4">
            <h2 className="mb-3 text-[11px] tracking-[0.14em] text-ink-soft uppercase">
              Kayıtlı Adresler ({addresses.length})
            </h2>
            {addresses.length === 0 ? (
              <p className="text-xs text-ink-faint">Kayıtlı adres yok.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {addresses.map((address) => (
                  <li key={address.id} className="text-xs leading-relaxed text-ink-soft">
                    <div className="text-ink">
                      {address.title}
                      {address.isDefault && (
                        <span className="ml-2 text-[10px] text-gold-deep uppercase">Varsayılan</span>
                      )}
                    </div>
                    {address.fullName} · {address.phone}
                    <br />
                    {address.addressLine}, {address.neighbourhood}, {address.district} / {address.city}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-white px-4 py-3">
      <div className="text-[10px] tracking-[0.14em] text-ink-soft uppercase">{label}</div>
      <div className="mt-1 text-lg">{value}</div>
    </div>
  );
}
