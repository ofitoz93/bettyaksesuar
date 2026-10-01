import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import { getCategories, categoryLabelMap } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";

export const metadata = {
  title: "Mağaza | Betty Aksesuar",
};

interface MagazaPageProps {
  searchParams: Promise<{ kategori?: string; ara?: string; sirala?: string; stokta?: string }>;
}

export default async function MagazaPage({ searchParams }: MagazaPageProps) {
  const { kategori, ara, sirala, stokta } = await searchParams;
  const categories = await getCategories();
  const labels = categoryLabelMap(categories);
  const activeCategory = categories.some((c) => c.slug === kategori) ? kategori : undefined;
  const search = ara?.trim() || undefined;

  let products = await getProducts(activeCategory, search);

  if (stokta === "1") {
    products = products.filter((p) => (p.stock ?? 0) > 0);
  }

  if (sirala === "cok-satan") {
    products = products
      .slice()
      .sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller));
  } else if (sirala === "fiyat-artan") {
    products = products.slice().sort((a, b) => a.price - b.price);
  } else if (sirala === "fiyat-azalan") {
    products = products.slice().sort((a, b) => b.price - a.price);
  }

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
                  ? labels[activeCategory]
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
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/magaza?kategori=${category.slug}`}
                className={`border px-5 py-2.5 text-xs tracking-[0.1em] uppercase ${
                  activeCategory === category.slug
                    ? "border-ink bg-ink text-ivory"
                    : "border-line text-ink-soft hover:border-ink"
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>

          <ProductFilters />

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
