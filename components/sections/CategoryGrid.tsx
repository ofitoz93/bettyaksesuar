import Image from "next/image";
import Link from "next/link";
import CategoryIcon, { categoryLabels, PRODUCT_CATEGORIES } from "@/components/ui/CategoryIcon";
import { getCategoryImages } from "@/lib/data/categoryImages";

export default async function CategoryGrid() {
  const categoryImages = await getCategoryImages();

  return (
    <section className="px-8 pt-24 pb-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
            KATEGORİLER
          </div>
          <h2 className="font-display mt-2.5 text-[34px]">
            Kategoriye Göre Keşfet
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
          {PRODUCT_CATEGORIES.map((category) => {
            const image = categoryImages[category];
            return (
              <Link
                key={category}
                href={`/magaza?kategori=${category}`}
                className="group block text-center"
              >
                <div className="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-full border border-line bg-ivory-deep">
                  {image ? (
                    <Image
                      src={image}
                      alt={categoryLabels[category]}
                      width={140}
                      height={140}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <CategoryIcon category={category} size={46} className="text-ink" />
                  )}
                </div>
                <span className="text-[13.5px] tracking-wide group-hover:text-gold-deep">
                  {categoryLabels[category]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
