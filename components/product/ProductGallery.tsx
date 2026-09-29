"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import CategoryIcon from "@/components/ui/CategoryIcon";
import type { Product } from "@/lib/types";

export default function ProductGallery({ product }: { product: Product }) {
  const images = product.images ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div>
      <div
        ref={containerRef}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
        className="relative mb-3 flex aspect-square cursor-zoom-in items-center justify-center overflow-hidden bg-linear-to-br from-[#EDE3D2] to-[#D9C7A6]"
      >
        {active ? (
          <Image
            key={active}
            src={active}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 ease-out"
            style={{
              transformOrigin: origin,
              transform: zoomed ? "scale(2)" : "scale(1)",
            }}
            priority
          />
        ) : (
          <CategoryIcon category={product.category} size={96} className="text-[#8C6A44]" />
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2.5">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden border ${
                index === activeIndex ? "border-ink" : "border-line"
              }`}
              aria-label={`Görsel ${index + 1}`}
            >
              <Image src={image} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
