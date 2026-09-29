"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import heroImage from "@/public/images/hero-bg.jpg";

const AUTO_ADVANCE_MS = 30000;

export default function HeroCarousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const hasCustomImages = images.length > 0;

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [images.length]);

  const goTo = (target: number) => {
    setIndex(((target % images.length) + images.length) % images.length);
  };

  if (!hasCustomImages) {
    return (
      <Image
        src={heroImage}
        alt="Verastone Aksesuar"
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="object-cover"
      />
    );
  }

  return (
    <>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt="Verastone Aksesuar"
          fill
          priority={i === 0}
          quality={90}
          sizes="100vw"
          className={`object-cover transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Önceki görsel"
            className="absolute top-1/2 left-4 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/40 text-ivory transition-colors hover:border-ivory hover:bg-ivory/10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Sonraki görsel"
            className="absolute top-1/2 right-4 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/40 text-ivory transition-colors hover:border-ivory hover:bg-ivory/10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${i + 1}. görsele git`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-ivory" : "w-1.5 bg-ivory/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
