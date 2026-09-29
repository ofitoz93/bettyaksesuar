import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import CategoryIcon from "./CategoryIcon";
import Badge from "./Badge";

export default function ProductCard({ product }: { product: Product }) {
  const cover = product.images?.[0];

  return (
    <Link href={`/urun/${product.slug}`} className="group block">
      <div className="relative mb-3.5 flex aspect-square items-center justify-center overflow-hidden bg-linear-to-br from-[#EDE3D2] to-[#D9C7A6]">
        {cover ? (
          <Image
            src={cover}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <CategoryIcon
            category={product.category}
            size={46}
            className="text-[#8C6A44]"
          />
        )}
        {product.isNew && <Badge>YENİ</Badge>}
        {product.discountPercent && (
          <Badge tone="gold">-%{product.discountPercent}</Badge>
        )}
      </div>
      <div className="text-sm text-ink group-hover:text-gold-deep">
        {product.name}
      </div>
      <div className="flex items-center gap-2 text-sm text-ink-soft">
        <span>₺{product.price}</span>
        {product.compareAtPrice && (
          <span className="text-ink-faint line-through">
            ₺{product.compareAtPrice}
          </span>
        )}
      </div>
    </Link>
  );
}
