import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import IframeEscape from "@/components/checkout/IframeEscape";

export const metadata = {
  title: "Ödeme Başarısız | Betty Aksesuar",
};

export default function OdemeBasarisizPage() {
  return (
    <>
      <IframeEscape />
      <Header variant="solid" />
      <main className="px-8 pt-32 pb-24">
        <div className="mx-auto max-w-lg py-10 text-center">
          <h1 className="font-display mb-2 text-2xl">Ödeme Tamamlanamadı</h1>
          <p className="mb-8 text-sm text-ink-soft">
            Ödemeniz alınamadı ya da iptal edildi. Sepetinizdeki ürünler için stok rezervasyonu
            kaldırıldı; dilerseniz tekrar deneyebilirsiniz.
          </p>
          <Link
            href="/sepet"
            className="inline-block border border-ink px-8 py-3.5 text-xs tracking-[0.14em] uppercase hover:bg-ink hover:text-ivory"
          >
            Sepete Dön
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
