import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import IframeEscape from "@/components/checkout/IframeEscape";
import { createServiceClient } from "@/lib/supabase/service";

export const metadata = {
  title: "Ödeme Sonucu | Betty Aksesuar",
};

interface PageProps {
  searchParams: Promise<{ oid?: string }>;
}

async function lookupOrder(oid: string | undefined) {
  if (!oid) return null;

  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("orders")
      .select("order_number, payment_status")
      .eq("paytr_merchant_oid", oid)
      .maybeSingle();
    return data;
  } catch (err) {
    console.error("odeme/basarili lookup error:", err);
    return null;
  }
}

export default async function OdemeBasariliPage({ searchParams }: PageProps) {
  const { oid } = await searchParams;
  const order = await lookupOrder(oid);
  const paid = order?.payment_status === "odendi";

  return (
    <>
      <IframeEscape />
      <Header variant="solid" />
      <main className="px-8 pt-32 pb-24">
        <div className="mx-auto max-w-lg py-10 text-center">
          {paid ? (
            <>
              <div className="mb-3 text-2xl text-gold-deep">✓</div>
              <h1 className="font-display mb-2 text-2xl">Ödemeniz Alındı</h1>
              {order?.order_number && (
                <p className="mb-8 text-sm text-ink-soft">
                  Sipariş numaranız: <span className="text-ink">{order.order_number}</span>
                </p>
              )}
            </>
          ) : (
            <>
              <h1 className="font-display mb-2 text-2xl">Ödeme Onayı Bekleniyor</h1>
              <p className="mb-8 text-sm text-ink-soft">
                Ödemeniz bankanız tarafından onaylanıyor, bu birkaç dakika sürebilir. Sipariş
                durumunu üye girişiyle &ldquo;Siparişlerim&rdquo; sayfasından takip edebilirsiniz.
              </p>
            </>
          )}
          <Link
            href="/magaza"
            className="inline-block border border-ink px-8 py-3.5 text-xs tracking-[0.14em] uppercase hover:bg-ink hover:text-ivory"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
