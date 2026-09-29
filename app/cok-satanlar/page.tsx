import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import { getBestSellers } from "@/lib/data/products";

export const metadata = {
  title: "Çok Satanlar | Verastone Aksesuar",
};

export default async function CokSatanlarPage() {
  const products = await getBestSellers(24);

  return (
    <>
      <Header variant="solid" />
      <main className="px-8 pt-32 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
              EN ÇOK TERCİH EDİLENLER
            </div>
            <h1 className="font-display mt-2.5 text-[34px]">Çok Satanlar</h1>
          </div>

          {products.length === 0 ? (
            <p className="text-center text-sm text-ink-soft">
              Henüz çok satan ürün işaretlenmedi.
            </p>
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
