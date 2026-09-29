import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartView from "@/components/cart/CartView";
import { getShippingSettings } from "@/lib/data/shipping";

export const metadata = {
  title: "Sepetim | Betty Aksesuar",
};

export default async function SepetPage() {
  const shippingSettings = await getShippingSettings();

  return (
    <>
      <Header variant="solid" />
      <main className="px-8 pt-32 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
              SEPETİM
            </div>
            <h1 className="font-display mt-2.5 text-[34px]">Sepetim</h1>
          </div>
          <CartView shippingSettings={shippingSettings} />
        </div>
      </main>
      <Footer />
    </>
  );
}
