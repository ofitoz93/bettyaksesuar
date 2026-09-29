import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import { categoryLabels, PRODUCT_CATEGORIES } from "@/components/ui/CategoryIcon";
import { getProducts } from "@/lib/data/products";
import type { ProductCategory } from "@/lib/types";

export const metadata = {
  title: "Mağaza | Verastone Aksesuar",
};

interface MagazaPageProps {
  searchParams: Promise<{ kategori?: string; ara?: string }>;
}

export default async function MagazaPage({ searchParams }: MagazaPageProps) {
  const { kategori, ara } = await searchParams;
  const activeCategory = PRODUCT_CATEGORIES.includes(kategori as ProductCategory)
    ? (kategori as ProductCategory)
    : undefined;
  const search = ara?.trim() || undefined;

  const products = await getProducts(activeCategory, search);

  return (
    <>
      <Header variant="solid" />
      <main className="px-8 pt-32 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
              MAĞAZA
            </div>
            <h1 className="font-display mt-2.5 text-[34px]">
              {search
                ? `"${search}" için sonuçlar`
                : activeCategory
                  ? categoryLabels[activeCategory]
                  : "Tüm Ürünler"}
            </h1>
          </div>

          <div className="mb-12 flex flex-wrap justify-center gap-3">
            <Link
              href="/magaza"
              className={`border px-5 py-2.5 text-xs tracking-[0.1em] uppercase ${
                !activeCategory
                  ? "border-ink bg-ink text-ivory"
                  : "border-line text-ink-soft hover:border-ink"
              }`}
            >
              Tümü
            </Link>
            {PRODUCT_CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/magaza?kategori=${category}`}
                className={`border px-5 py-2.5 text-xs tracking-[0.1em] uppercase ${
                  activeCategory === category
                    ? "border-ink bg-ink text-ivory"
                    : "border-line text-ink-soft hover:border-ink"
                }`}
              >
                {categoryLabels[category]}
              </Link>
            ))}
          </div>

          {products.length === 0 ? (
            <p className="text-center text-sm text-ink-soft">
              {search ? "Aramanızla eşleşen ürün bulunamadı." : "Bu kategoride henüz ürün yok."}
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
