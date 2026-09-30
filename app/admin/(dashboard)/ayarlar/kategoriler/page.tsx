import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/data/categories";
import DeleteCategoryButton from "./DeleteCategoryButton";

export default async function KategorilerPage() {
  const categories = await getCategories();
  const nameBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.name]));

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[28px]">Kategoriler</h1>
        <Link
          href="/admin/ayarlar/kategoriler/yeni"
          className="bg-ink px-6 py-3 text-xs font-medium tracking-[0.14em] text-ivory uppercase hover:bg-gold-deep"
        >
          + Yeni Kategori
        </Link>
      </div>

      <div className="overflow-x-auto border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs tracking-wide text-ink-soft uppercase">
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">SEO Bağlantısı</th>
              <th className="px-4 py-3 font-medium">Üst Kategori</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.slug} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-linear-to-br from-[#EDE3D2] to-[#D9C7A6]">
                      {category.imageUrl && (
                        <Image
                          src={category.imageUrl}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    {category.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-soft">/{category.slug}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {category.parentSlug ? nameBySlug[category.parentSlug] : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/ayarlar/kategoriler/${category.slug}`}
                      className="text-xs tracking-wide text-ink-soft hover:text-ink"
                    >
                      Düzenle
                    </Link>
                    <DeleteCategoryButton slug={category.slug} name={category.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
