import Image from "next/image";
import Link from "next/link";
import CategoryIcon, { categoryLabels, PRODUCT_CATEGORIES } from "@/components/ui/CategoryIcon";
import { getCategoryImages } from "@/lib/data/categoryImages";

const SPARKLES = [
  { top: "10%", left: "22%", size: 8, delay: "0s", duration: "1.3s" },
  { top: "18%", left: "68%", size: 6, delay: "0.3s", duration: "1.5s" },
  { top: "30%", left: "40%", size: 5, delay: "0.7s", duration: "1.2s" },
  { top: "42%", left: "80%", size: 7, delay: "0.15s", duration: "1.6s" },
  { top: "48%", left: "10%", size: 6, delay: "0.9s", duration: "1.4s" },
  { top: "55%", left: "55%", size: 5, delay: "1.2s", duration: "1.3s" },
  { top: "62%", left: "28%", size: 8, delay: "0.5s", duration: "1.7s" },
  { top: "70%", left: "72%", size: 5, delay: "1.4s", duration: "1.5s" },
  { top: "78%", left: "45%", size: 7, delay: "0.25s", duration: "1.6s" },
  { top: "35%", left: "60%", size: 4, delay: "1.0s", duration: "1.2s" },
  { top: "20%", left: "35%", size: 4, delay: "0.6s", duration: "1.4s" },
  { top: "85%", left: "20%", size: 5, delay: "1.1s", duration: "1.3s" },
];

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
                <div className="relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-full border border-line bg-ivory-deep">
                  {image ? (
                    <Image
                      src={image}
                      alt={categoryLabels[category]}
                      width={140}
                      height={140}
                      quality={90}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <CategoryIcon category={category} size={46} className="text-ink" />
                  )}
                  <span aria-hidden className="sparkle-field pointer-events-none absolute inset-0">
                    {SPARKLES.map((sparkle, i) => (
                      <span
                        key={i}
                        className="sparkle"
                        style={{
                          top: sparkle.top,
                          left: sparkle.left,
                          width: sparkle.size,
                          animationDelay: sparkle.delay,
                          animationDuration: sparkle.duration,
                        }}
                      />
                    ))}
                  </span>
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
