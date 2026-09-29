import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import { getBestSellers } from "@/lib/data/products";

export default async function BestSellers() {
  const bestSellers = await getBestSellers();

  if (bestSellers.length === 0) {
    return null;
  }

  return (
    <section className="px-8 py-22">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
              EN ÇOK TERCİH EDİLENLER
            </div>
            <h2 className="font-display mt-2.5 text-[34px]">Çok Satanlar</h2>
          </div>
          <Link
            href="/cok-satanlar"
            className="border-b border-ink pb-1 text-xs tracking-[0.1em] uppercase hover:text-gold-deep hover:border-gold-deep"
          >
            Tümünü Gör →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
