"use client";

import { useActionState } from "react";
import { updateHeaderLinks, type ActionState } from "@/app/admin/actions";
import type { NavLink } from "@/lib/data/siteSettings";
import LinkListEditor from "@/components/admin/LinkListEditor";

const initialState: ActionState = {};

export default function HeaderForm({
  primaryLinks,
  secondaryLinks,
}: {
  primaryLinks: NavLink[];
  secondaryLinks: NavLink[];
}) {
  const [state, formAction, pending] = useActionState(updateHeaderLinks, initialState);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-8">
      <div>
        <h2 className="mb-1 text-sm font-medium">Sol Menü (kategori linkleri)</h2>
        <p className="mb-3 text-xs text-ink-soft">Logo&apos;nun solunda, arama kutusunun yanında görünür.</p>
        <LinkListEditor name="headerPrimaryLinks" defaultLinks={primaryLinks} />
      </div>

      <div>
        <h2 className="mb-1 text-sm font-medium">Sağ Menü</h2>
        <p className="mb-3 text-xs text-ink-soft">Logo&apos;nun sağında, hesap/sepet ikonlarının yanında görünür.</p>
        <LinkListEditor name="headerSecondaryLinks" defaultLinks={secondaryLinks} />
      </div>

      {state.error && <p className="text-xs text-status-red-fg">{state.error}</p>}
      {state !== initialState && !state.error && !pending && (
        <p className="text-xs text-status-green-fg">Kaydedildi.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
      >
        {pending ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}
