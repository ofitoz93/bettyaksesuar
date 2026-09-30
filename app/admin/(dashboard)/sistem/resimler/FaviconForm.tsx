"use client";

import { useActionState } from "react";
import Image from "next/image";
import { uploadFavicon, type ActionState } from "@/app/admin/actions";

const initialState: ActionState = {};

export default function FaviconForm({ faviconUrl }: { faviconUrl: string | null }) {
  const [state, formAction, pending] = useActionState(uploadFavicon, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      {faviconUrl && (
        <div className="relative h-10 w-10 overflow-hidden border border-line">
          <Image src={faviconUrl} alt="" fill sizes="40px" className="object-contain" />
        </div>
      )}
      <input
        name="favicon"
        type="file"
        accept="image/png,image/x-icon,image/svg+xml"
        required
        className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
      />

      {state.error && <p className="text-xs text-status-red-fg">{state.error}</p>}
      {state !== initialState && !state.error && !pending && (
        <p className="text-xs text-status-green-fg">Kaydedildi.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
      >
        {pending ? "Yükleniyor..." : "Faviconu Kaydet"}
      </button>
    </form>
  );
}
