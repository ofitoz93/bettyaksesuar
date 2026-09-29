import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import CategoryIcon from "./CategoryIcon";
import Badge from "./Badge";

export default function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const cover = product.images?.[0];

  return (
    <Link href={`/urun/${product.slug}`} className="group block">
      <div
        className={`relative flex aspect-square items-center justify-center overflow-hidden bg-linear-to-br from-[#EDE3D2] to-[#D9C7A6] ${compact ? "mb-1.5" : "mb-3.5"}`}
      >
        {cover ? (
          <Image
            src={cover}
            alt={product.name}
            fill
            quality={90}
            sizes={compact ? "120px" : "(min-width: 768px) 25vw, 50vw"}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <CategoryIcon
            category={product.category}
            size={compact ? 24 : 46}
            className="text-[#8C6A44]"
          />
        )}
        {product.isNew && <Badge>YENİ</Badge>}
        {product.discountPercent && (
          <Badge tone="gold">-%{product.discountPercent}</Badge>
        )}
      </div>
      <div
        className={`text-ink group-hover:text-gold-deep ${compact ? "line-clamp-1 text-[11px]" : "text-sm"}`}
      >
        {product.name}
      </div>
      <div
        className={`flex items-center gap-2 text-ink-soft ${compact ? "text-[11px]" : "text-sm"}`}
      >
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
