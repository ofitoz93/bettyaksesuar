"use client";

import { useActionState } from "react";
import Image from "next/image";
import { addHeroImages, removeHeroImage, type ActionState } from "@/app/admin/actions";
import type { HeroImage } from "@/lib/data/heroImages";

const initialState: ActionState = {};
const MAX_HERO_IMAGES = 5;

export default function HeroImagesManager({ images }: { images: HeroImage[] }) {
  const [state, formAction, pending] = useActionState(addHeroImages, initialState);
  const canAddMore = images.length < MAX_HERO_IMAGES;

  return (
    <div>
      <h2 className="mb-1 text-sm font-medium">Hero Görselleri</h2>
      <p className="mb-4 text-xs text-ink-soft">
        Birden fazla görsel eklerseniz ana sayfada otomatik olarak sırayla gösterilir (30
        saniyede bir geçiş yapar), ziyaretçiler ok tuşlarıyla da elle geçiş yapabilir. Tek
        görsel eklerseniz sabit kalır. Hiç görsel eklemezseniz varsayılan fotoğraf kullanılır.
        En fazla {MAX_HERO_IMAGES} görsel.
      </p>

      {images.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {images.map((image, index) => (
            <div key={image.id} className="relative">
              <div className="relative aspect-video overflow-hidden border border-line">
                <Image src={image.imageUrl} alt="" fill sizes="180px" className="object-cover" />
                <span className="absolute top-1 left-1 bg-ink/70 px-1.5 py-0.5 text-[10px] text-ivory">
                  {index + 1}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeHeroImage(image.id)}
                className="mt-1 block w-full text-center text-[10px] tracking-wide text-status-red-fg hover:opacity-70"
              >
                Kaldır
              </button>
            </div>
          ))}
        </div>
      )}

      {canAddMore ? (
        <form action={formAction} className="flex flex-wrap items-center gap-3">
          <input
            name="images"
            type="file"
            accept="image/*"
            multiple
            className="min-w-64 flex-1 border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
          <button
            type="submit"
            disabled={pending}
            className="bg-ink px-6 py-3 text-xs font-medium tracking-[0.14em] text-ivory uppercase hover:bg-gold-deep disabled:opacity-50"
          >
            {pending ? "Yükleniyor..." : "Görsel Ekle"}
          </button>
        </form>
      ) : (
        <p className="text-xs text-ink-faint">
          Maksimum görsel sayısına ulaştınız. Yeni eklemek için önce birini kaldırın.
        </p>
      )}

      {state.error && <p className="mt-2 text-xs text-status-red-fg">{state.error}</p>}
    </div>
  );
}
