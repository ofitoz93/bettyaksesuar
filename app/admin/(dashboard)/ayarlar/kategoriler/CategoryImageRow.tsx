"use client";

import { useActionState } from "react";
import Image from "next/image";
import { updateCategoryImage, removeCategoryImage, type ActionState } from "@/app/admin/actions";

const initialState: ActionState = {};

export default function CategoryImageRow({
  category,
  label,
  imageUrl,
}: {
  category: string;
  label: string;
  imageUrl: string | null;
}) {
  const updateWithCategory = updateCategoryImage.bind(null, category);
  const [state, formAction, pending] = useActionState(updateWithCategory, initialState);

  return (
    <div className="flex flex-wrap items-center gap-5 px-5 py-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-line bg-ivory-deep">
        {imageUrl && <Image src={imageUrl} alt={label} fill sizes="64px" className="object-cover" />}
      </div>

      <div className="w-32 shrink-0 text-sm">{label}</div>

      <form action={formAction} className="flex flex-1 flex-wrap items-center gap-3">
        <input
          name="image"
          type="file"
          accept="image/*"
          className="min-w-48 flex-1 border border-line bg-white px-3 py-2 text-xs outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-ink px-5 py-2 text-[11px] font-medium tracking-[0.1em] text-ivory uppercase hover:bg-gold-deep disabled:opacity-50"
        >
          {pending ? "Yükleniyor..." : "Yükle"}
        </button>
        {imageUrl && (
          <button
            type="button"
            onClick={() => removeCategoryImage(category)}
            className="text-xs text-status-red-fg hover:opacity-70"
          >
            Kaldır
          </button>
        )}
      </form>

      {state.error && <p className="w-full text-xs text-status-red-fg">{state.error}</p>}
    </div>
  );
}
