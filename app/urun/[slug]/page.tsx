import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductGallery from "@/components/product/ProductGallery";
import AddToCartButton from "@/components/product/AddToCartButton";
import StockNotifyForm from "@/components/product/StockNotifyForm";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getProductBySlug } from "@/lib/data/products";
import { getCurrentProfile } from "@/lib/data/profile";

interface UrunPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: UrunPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Ürün Bulunamadı" };
  }

  return {
    title: product.metaTitle || `${product.name} | Betty Aksesuar`,
    description: product.metaDescription || product.description || undefined,
    keywords: product.metaKeywords || undefined,
  };
}

export default async function UrunPage({ params }: UrunPageProps) {
  const { slug } = await params;
  const [product, profile] = await Promise.all([
    getProductBySlug(slug),
    getCurrentProfile(),
  ]);

  if (!product) {
    notFound();
  }

  const category = await getCategoryBySlug(product.category);

  const inStock = (product.stock ?? 0) > 0;

  return (
    <>
      <Header variant="solid" />
      <main className="px-8 pt-32 pb-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
          <ProductGallery product={product} />

          <div>
            <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
              {category?.name ?? product.category}
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
              <div
                className="mt-6 max-w-md text-sm leading-relaxed text-ink-soft"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}

            {inStock ? (
              <div className="mt-4 text-xs tracking-wide text-ink-soft">
                Stokta {product.stock} adet
              </div>
            ) : (
              <div className="mt-4">
                <div className="text-xs tracking-wide text-status-red-fg">Stokta yok</div>
                <StockNotifyForm
                  productId={product.id}
                  productName={product.name}
                  productSlug={product.slug}
                  userEmail={profile?.email}
                />
              </div>
            )}

            <div className="mt-8">
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton
        productName={product.name}
        productUrl={`${(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")}/urun/${product.slug}`}
      />
    </>
  );
}
