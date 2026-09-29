import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { getShippingSettings } from "@/lib/data/shipping";
import { getCurrentProfile } from "@/lib/data/profile";

export const metadata = {
  title: "Ödeme | Verastone Aksesuar",
};

export default async function OdemePage() {
  const [shippingSettings, profile] = await Promise.all([
    getShippingSettings(),
    getCurrentProfile(),
  ]);

  return (
    <>
      <Header variant="solid" />
      <main className="px-8 pt-32 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
              ÖDEME
            </div>
            <h1 className="font-display mt-2.5 text-[34px]">Siparişi Tamamla</h1>
          </div>
          <CheckoutForm shippingSettings={shippingSettings} profile={profile} />
        </div>
      </main>
      <Footer />
    </>
  );
}
