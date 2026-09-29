import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductGallery from "@/components/product/ProductGallery";
import AddToCartButton from "@/components/product/AddToCartButton";
import { categoryLabels } from "@/components/ui/CategoryIcon";
import { getProductBySlug } from "@/lib/data/products";

interface UrunPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UrunPage({ params }: UrunPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <Header variant="solid" />
      <main className="px-8 pt-32 pb-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
          <ProductGallery product={product} />

          <div>
            <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
              {categoryLabels[product.category]}
            </div>
            <h1 className="font-display mt-2.5 text-[34px]">{product.name}</h1>

            <div className="mt-5 flex items-center gap-3 text-xl text-ink">
              <span>₺{product.price}</span>
              {product.compareAtPrice && (
                <span className="text-base text-ink-faint line-through">
                  ₺{product.compareAtPrice}
                </span>
              )}
            </div>

            {product.description && (
              <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-soft">
                {product.description}
              </p>
            )}

            <div className="mt-4 text-xs tracking-wide text-ink-soft">
              {product.stock && product.stock > 0
                ? `Stokta ${product.stock} adet`
                : "Stokta yok"}
            </div>

            <div className="mt-8">
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
