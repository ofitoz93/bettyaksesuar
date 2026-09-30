import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/data/products";
import { getCategories, categoryLabelMap } from "@/lib/data/categories";
import DeleteProductButton from "./DeleteProductButton";
import DuplicateProductButton from "./DuplicateProductButton";

export default async function AdminDashboardPage() {
  const [products, categories] = await Promise.all([
    getProducts(undefined, undefined, { includeInactive: true }),
    getCategories(),
  ]);
  const labels = categoryLabelMap(categories);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[28px]">Ürünler</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/urun/toplu-ekle"
            className="border border-ink px-6 py-3 text-xs font-medium tracking-[0.14em] text-ink uppercase hover:bg-ivory-deep"
          >
            Toplu Ürün Ekle
          </Link>
          <Link
            href="/admin/urun/yeni"
            className="bg-ink px-6 py-3 text-xs font-medium tracking-[0.14em] text-ivory uppercase hover:bg-gold-deep"
          >
            + Yeni Ürün
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Henüz ürün yok. &ldquo;Yeni Ürün&rdquo; ile ilk ürününüzü ekleyin.
        </p>
      ) : (
        <div className="overflow-x-auto border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-ink-soft uppercase">
                <th className="px-4 py-3 font-medium">Ürün</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Fiyat</th>
                <th className="px-4 py-3 font-medium">Stok</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-linear-to-br from-[#EDE3D2] to-[#D9C7A6]">
                        {product.images?.[0] && (
                          <Image
                            src={product.images[0]}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      {product.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {labels[product.category] ?? product.category}
                  </td>
                  <td className="px-4 py-3">₺{product.price}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        product.stock && product.stock > 0
                          ? ""
                          : "text-status-red-fg"
                      }
                    >
                      {product.stock ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] ${
                          product.isActive
                            ? "bg-status-green-bg text-status-green-fg"
                            : "bg-status-red-bg text-status-red-fg"
                        }`}
                      >
                        {product.isActive ? "Aktif" : "Pasif"}
                      </span>
                      {product.isNew && (
                        <span className="bg-status-blue-bg px-2 py-0.5 text-[10px] text-status-blue-fg">
                          Yeni
                        </span>
                      )}
                      {product.isBestSeller && (
                        <span className="bg-status-amber-bg px-2 py-0.5 text-[10px] text-status-amber-fg">
                          Çok Satan
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-4">
                      <Link
                        href={`/admin/urun/${product.id}`}
                        className="text-xs tracking-wide text-ink-soft hover:text-ink"
                      >
                        Düzenle
                      </Link>
                      <DuplicateProductButton id={product.id} />
                      <DeleteProductButton id={product.id} name={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
