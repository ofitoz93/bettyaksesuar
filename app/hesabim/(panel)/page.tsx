import Link from "next/link";
import { getCurrentProfile } from "@/lib/data/profile";
import { getMyOrders } from "@/lib/data/orders";
import { getMyAddresses } from "@/lib/data/addresses";
import { formatPrice } from "@/lib/orders";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";

export const metadata = { title: "Hesabım | Betty Aksesuar" };

export default async function HesabimPage() {
  const [profile, orders, addresses] = await Promise.all([
    getCurrentProfile(),
    getMyOrders(),
    getMyAddresses(),
  ]);

  // Profil doluluk oranı: e-posta, ad soyad, telefon, varsayılan adres
  const completionSteps = [
    { done: Boolean(profile?.email), label: "E-posta" },
    { done: Boolean(profile?.fullName), label: "Ad soyad" },
    { done: Boolean(profile?.phone), label: "Telefon", href: "/hesabim/profil" },
    { done: addresses.some((a) => a.isDefault), label: "Teslimat adresi", href: "/hesabim/adreslerim" },
  ];
  const completion = Math.round(
    (completionSteps.filter((s) => s.done).length / completionSteps.length) * 100,
  );
  const missing = completionSteps.filter((s) => !s.done);
  const activeOrders = orders.filter((o) => ["beklemede", "onaylandi", "kargoda"].includes(o.status));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-4">
        <h1 className="font-display text-[28px]">Genel Bakış</h1>
        <span className="text-xs text-ink-soft">
          Giriş yapılan hesap: <span className="text-ink">{profile?.email}</span>
        </span>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Profil" value={`%${completion}`} note="tamamlandı" href="/hesabim/profil" />
        <Stat label="Adresler" value={String(addresses.length)} note="kayıtlı" href="/hesabim/adreslerim" />
        <Stat label="Siparişler" value={String(orders.length)} note="toplam" href="/hesabim/siparislerim" />
        <Stat label="Aktif" value={String(activeOrders.length)} note="devam eden sipariş" href="/hesabim/siparislerim" />
      </div>

      {missing.length > 0 && (
        <div className="mb-10 border border-gold-deep/40 bg-gold-tint px-5 py-4 text-sm">
          <div className="mb-1 font-medium">Profilinizi tamamlayın</div>
          <p className="text-xs text-ink-soft">
            Daha hızlı sipariş verebilmek için eksik bilgileri ekleyin:{" "}
            {missing.map((step, i) => (
              <span key={step.label}>
                {i > 0 && ", "}
                {step.href ? (
                  <Link href={step.href} className="text-ink underline hover:text-gold-deep">
                    {step.label}
                  </Link>
                ) : (
                  step.label
                )}
              </span>
            ))}
          </p>
        </div>
      )}

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xs tracking-[0.14em] text-ink-soft uppercase">Son Siparişler</h2>
        {orders.length > 0 && (
          <Link href="/hesabim/siparislerim" className="text-xs text-ink-soft hover:text-ink">
            Tümünü gör →
          </Link>
        )}
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
        <ul className="flex flex-col gap-2.5">
          {orders.slice(0, 5).map((order) => (
            <li key={order.id}>
              <Link
                href={`/hesabim/siparislerim/${order.id}`}
                className="grid grid-cols-2 items-center gap-x-4 gap-y-1 border border-line bg-white px-5 py-4 text-sm hover:border-ink sm:grid-cols-[1fr_1fr_auto_auto]"
              >
                <div>
                  <div className="text-[10px] tracking-wide text-ink-faint uppercase">Tarih</div>
                  {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                </div>
                <div>
                  <div className="text-[10px] tracking-wide text-ink-faint uppercase">Sipariş No</div>
                  <span className="break-all">{order.orderNumber}</span>
                </div>
                <div>
                  <div className="text-[10px] tracking-wide text-ink-faint uppercase">Tutar</div>
                  {formatPrice(order.total)}
                </div>
                <div className="flex items-center gap-3 justify-self-start sm:justify-self-end">
                  <OrderStatusBadge status={order.status} />
                  <span className="hidden text-ink-faint sm:inline">→</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value, note, href }: { label: string; value: string; note: string; href: string }) {
  return (
    <Link href={href} className="border border-line bg-white px-4 py-4 hover:border-ink">
      <div className="text-[10px] tracking-[0.14em] text-ink-soft uppercase">{label}</div>
      <div className="font-display mt-1 text-3xl leading-none">{value}</div>
      <div className="mt-1 text-[11px] text-ink-faint">{note}</div>
    </Link>
  );
}
