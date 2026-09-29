"use client";

import { useActionState } from "react";
import Image from "next/image";
import {
  addSocialFeedImages,
  removeSocialFeedImage,
  type ActionState,
} from "@/app/admin/actions";
import type { SocialFeedImage } from "@/lib/data/socialFeed";

const initialState: ActionState = {};

export default function SocialFeedManager({ images }: { images: SocialFeedImage[] }) {
  const [state, formAction, pending] = useActionState(addSocialFeedImages, initialState);

  return (
    <div>
      {images.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {images.map((image) => (
            <div key={image.id} className="relative">
              <div className="relative aspect-square overflow-hidden border border-line">
                <Image
                  src={image.imageUrl}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSocialFeedImage(image.id)}
                className="mt-1 block w-full text-center text-[10px] tracking-wide text-status-red-fg hover:opacity-70"
              >
                Kaldır
              </button>
            </div>
          ))}
        </div>
      )}

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

      {state.error && <p className="mt-2 text-xs text-status-red-fg">{state.error}</p>}
    </div>
  );
}
