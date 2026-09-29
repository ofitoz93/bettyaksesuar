import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import { getProducts } from "@/lib/data/products";
import { getSiteSettings } from "@/lib/data/siteSettings";

export const metadata = {
  title: "Kişiye Özel Koleksiyon | Betty Aksesuar",
};

export default async function KisiyeOzelPage() {
  const [products, settings] = await Promise.all([getProducts(), getSiteSettings()]);

  return (
    <>
      <Header variant="solid" />
      <main className="px-8 pt-32 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
              {settings.campaignEyebrow}
            </div>
            <h1 className="font-display mt-2.5 text-[34px]">
              {settings.campaignHeading.split("\n").join(" ")}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">{settings.campaignBody}</p>
          </div>

          {products.length === 0 ? (
            <p className="text-center text-sm text-ink-soft">Henüz ürün eklenmedi.</p>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
