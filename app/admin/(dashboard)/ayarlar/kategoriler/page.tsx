import { PRODUCT_CATEGORIES, categoryLabels } from "@/components/ui/CategoryIcon";
import { getCategoryImages } from "@/lib/data/categoryImages";
import CategoryImageRow from "./CategoryImageRow";

export default async function KategorilerAyarlarPage() {
  const images = await getCategoryImages();

  return (
    <div>
      <h1 className="font-display mb-2 text-[28px]">Kategori Görselleri</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Her kategori için bir fotoğraf yükleyin. Yüklenmeyen kategoriler ana sayfada
        varsayılan ikonla gösterilir.
      </p>

      <div className="flex flex-col divide-y divide-line border-y border-line bg-white">
        {PRODUCT_CATEGORIES.map((category) => (
          <CategoryImageRow
            key={category}
            category={category}
            label={categoryLabels[category]}
            imageUrl={images[category] ?? null}
          />
        ))}
      </div>
    </div>
  );
}
