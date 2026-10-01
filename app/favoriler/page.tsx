import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import { getCurrentProfile } from "@/lib/data/profile";
import { getFavoriteProducts } from "@/lib/data/favorites";

export const metadata = { title: "Favorilerim | Betty Aksesuar" };

export default async function FavorilerPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <>
        <Header variant="solid" />
        <main className="px-8 pt-32 pb-24 text-center">
          <h1 className="font-display mb-4 text-[28px]">Favorilerim</h1>
          <p className="mb-6 text-sm text-ink-soft">
            Favori ürünlerinizi görmek için giriş yapmalısınız.
          </p>
          <Link
            href="/hesabim/giris"
            className="inline-block bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep"
          >
            Giriş Yap
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const products = await getFavoriteProducts();

  return (
    <>
      <Header variant="solid" />
      <main className="px-8 pt-32 pb-24">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display mb-10 text-[28px]">Favorilerim</h1>
          {products.length === 0 ? (
            <p className="text-sm text-ink-soft">Henüz favori ürününüz yok.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
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
