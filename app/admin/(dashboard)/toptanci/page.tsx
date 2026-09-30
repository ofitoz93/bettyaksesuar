import Image from "next/image";
import Link from "next/link";
import { getWholesaleProducts } from "@/lib/data/wholesaleProducts";
import DeleteWholesaleProductButton from "./DeleteWholesaleProductButton";

export default async function ToptanciHavuzuPage() {
  const products = await getWholesaleProducts();

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px]">Toptancı Havuzu</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Toplu ürün ekleme ile kaydedilen ürünler burada birikir. Detaya girip fotoğrafları
            indirebilirsiniz.
          </p>
        </div>
        <Link
          href="/admin/urun/toplu-ekle"
          className="bg-ink px-6 py-3 text-xs font-medium tracking-[0.14em] text-ivory uppercase hover:bg-gold-deep"
        >
          + Toplu Ürün Ekle
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Havuzda henüz ürün yok. &ldquo;Toplu Ürün Ekle&rdquo; ile ilk kaydı oluşturun.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="group relative border border-line bg-white p-3">
              <Link href={`/admin/toptanci/${product.id}`} className="block">
                <div className="relative aspect-square w-full overflow-hidden bg-linear-to-br from-[#EDE3D2] to-[#D9C7A6]">
                  {product.thumbnailUrl && (
                    <Image
                      src={product.thumbnailUrl}
                      alt=""
                      fill
                      sizes="200px"
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </div>
                <div className="mt-2 truncate text-sm">{product.name}</div>
                <div className="text-xs text-ink-soft">
                  {product.sku ? product.sku : "Kod yok"} · {product.imageCount} foto
                </div>
              </Link>
              <div className="mt-2 flex justify-end">
                <DeleteWholesaleProductButton id={product.id} name={product.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
