import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import { getNewArrivals } from "@/lib/data/products";

export const metadata = {
  title: "Yeni Gelenler | Verastone Aksesuar",
};

export default async function YeniGelenlerPage() {
  const products = await getNewArrivals(20);

  return (
    <>
      <Header variant="solid" />
      <main className="px-8 pt-32 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
              2026 SONBAHAR
            </div>
            <h1 className="font-display mt-2.5 text-[34px]">Yeni Gelenler</h1>
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
