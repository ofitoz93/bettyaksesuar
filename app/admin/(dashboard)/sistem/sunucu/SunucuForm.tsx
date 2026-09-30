"use client";

import { useActionState } from "react";
import { updateServerSettings, type ActionState } from "@/app/admin/actions";
import type { StoreSettings } from "@/lib/data/storeSettings";

const initialState: ActionState = {};

export default function SunucuForm({ settings }: { settings: StoreSettings }) {
  const [state, formAction, pending] = useActionState(updateServerSettings, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="maintenanceMode"
          defaultChecked={settings.maintenanceMode}
          className="h-4 w-4"
        />
        Bakım moduna al (siteyi ziyaretçilere kapat)
      </label>
      <p className="ml-6.5 -mt-2 text-xs text-status-red-fg">
        Bu açıkken sadece admin panelde oturum açmış kullanıcılar siteyi görür, diğer tüm
        ziyaretçilere bakım sayfası gösterilir.
      </p>

      <label className="mt-2 flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="seoUrlEnabled"
          defaultChecked={settings.seoUrlEnabled}
          className="h-4 w-4"
        />
        SEO URL kullan
      </label>

      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="sslEnabled"
          defaultChecked={settings.sslEnabled}
          className="h-4 w-4"
        />
        SSL (HTTPS) etkin
      </label>
      <p className="ml-6.5 -mt-2 text-xs text-ink-faint">
        Vercel üzerinde barındırılan siteler her zaman HTTPS ile sunulur; bu alan bilgi
        amaçlıdır.
      </p>

      {state.error && <p className="text-xs text-status-red-fg">{state.error}</p>}
      {state !== initialState && !state.error && !pending && (
        <p className="text-xs text-status-green-fg">Kaydedildi.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-fit bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
      >
        {pending ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}
