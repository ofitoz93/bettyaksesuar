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

  const showPrev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const showNext = () => setActiveIndex((i) => (i + 1) % images.length);

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
            quality={100}
            sizes="(min-width: 768px) 100vw, 200vw"
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

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrev}
              aria-label="Önceki görsel"
              className="absolute top-1/2 left-3 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-ink/20 bg-ivory/80 text-ink transition-colors hover:border-ink hover:bg-ivory"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Sonraki görsel"
              className="absolute top-1/2 right-3 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-ink/20 bg-ivory/80 text-ink transition-colors hover:border-ink hover:bg-ivory"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
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
              <Image src={image} alt="" fill quality={90} sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
