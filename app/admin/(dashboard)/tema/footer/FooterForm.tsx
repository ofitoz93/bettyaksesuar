"use client";

import { useActionState } from "react";
import { updateFooterContent, type ActionState } from "@/app/admin/actions";
import type { NavLink } from "@/lib/data/siteSettings";
import LinkListEditor from "@/components/admin/LinkListEditor";

const initialState: ActionState = {};

export default function FooterForm({
  description,
  helpLinks,
  companyLinks,
}: {
  description: string;
  helpLinks: NavLink[];
  companyLinks: NavLink[];
}) {
  const [state, formAction, pending] = useActionState(updateFooterContent, initialState);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-8">
      <div>
        <h2 className="mb-1 text-sm font-medium">Marka Açıklaması</h2>
        <textarea
          name="footerDescription"
          rows={3}
          defaultValue={description}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>

      <div>
        <h2 className="mb-1 text-sm font-medium">Yardım Bağlantıları</h2>
        <LinkListEditor name="footerHelpLinks" defaultLinks={helpLinks} />
      </div>

      <div>
        <h2 className="mb-1 text-sm font-medium">Kurumsal Bağlantılar</h2>
        <LinkListEditor name="footerCompanyLinks" defaultLinks={companyLinks} />
      </div>

      <p className="text-xs text-ink-faint">
        &ldquo;Alışveriş&rdquo; ve &ldquo;Koleksiyonlar&rdquo; sütunları mağaza ve kategori
        verisinden otomatik oluşturulur, buradan düzenlenmez.
      </p>

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
