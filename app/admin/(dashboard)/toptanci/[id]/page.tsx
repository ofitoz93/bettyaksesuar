import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getWholesaleProductById,
  getWholesaleProductImages,
} from "@/lib/data/wholesaleProducts";
import DeleteWholesaleProductButton from "../DeleteWholesaleProductButton";

interface ToptanciDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ToptanciDetailPage({ params }: ToptanciDetailPageProps) {
  const { id } = await params;
  const product = await getWholesaleProductById(id);

  if (!product) {
    notFound();
  }

  const images = await getWholesaleProductImages(id);

  return (
    <div>
      <Link href="/admin/toptanci" className="text-xs tracking-wide text-ink-soft hover:text-ink">
        ← Toptancı Havuzu
      </Link>

      <div className="mt-4 mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px]">{product.name}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {product.sku ? `Kod/Barkod: ${product.sku}` : "Kod/Barkod girilmemiş"}
          </p>
        </div>
        <DeleteWholesaleProductButton id={product.id} name={product.name} />
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-ink-soft">Bu ürün için fotoğraf eklenmemiş.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="border border-line bg-white p-3">
              <div className="relative aspect-square w-full overflow-hidden bg-linear-to-br from-[#EDE3D2] to-[#D9C7A6]">
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="240px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <a
                href={image.downloadUrl}
                download
                className="mt-2 block text-center text-xs tracking-wide text-ink-soft hover:text-ink"
              >
                İndir
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
