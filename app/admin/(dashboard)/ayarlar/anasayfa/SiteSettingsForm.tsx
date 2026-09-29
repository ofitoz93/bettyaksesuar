"use client";

import { useActionState } from "react";
import Image from "next/image";
import { updateSiteSettings } from "@/app/admin/actions";
import type { ActionState } from "@/app/admin/actions";
import type { SiteSettings } from "@/lib/data/siteSettings";

const initialState: ActionState = {};

export default function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(updateSiteSettings, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div>
        <h2 className="mb-4 text-sm font-medium">Marka</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Site Adı">
            <input
              name="siteName"
              required
              defaultValue={settings.siteName}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="Alt Başlık">
            <input
              name="siteTagline"
              required
              defaultValue={settings.siteTagline}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
        </div>
        {settings.logoUrl && (
          <div className="relative mt-4 mb-3 h-12 w-40 overflow-hidden">
            <Image src={settings.logoUrl} alt="" fill sizes="160px" className="object-contain" />
          </div>
        )}
        <div className="mt-4">
          <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">
            Logo Görseli (opsiyonel)
          </label>
          <input
            name="logo"
            type="file"
            accept="image/*"
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
          <p className="mt-1.5 text-xs text-ink-faint">
            Logo yüklerseniz site adı/alt başlık yerine header ve footer&apos;da bu görsel
            gösterilir.
          </p>
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h2 className="mb-4 text-sm font-medium">Duyuru Şeridi</h2>
        <Field label="Sayfanın en üstündeki şerit metni">
          <input
            name="announcementText"
            required
            defaultValue={settings.announcementText}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>
      </div>

      <div className="border-t border-line pt-6">
        <h2 className="mb-4 text-sm font-medium">Metinler</h2>
        <div className="flex flex-col gap-4">
          <Field label="Üst Etiket (küçük yazı)">
            <input
              name="heroEyebrow"
              required
              defaultValue={settings.heroEyebrow}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="Başlık (yeni satır için Enter'a basın)">
            <textarea
              name="heroHeading"
              required
              rows={2}
              defaultValue={settings.heroHeading}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="Alt Metin">
            <textarea
              name="heroSubtitle"
              required
              rows={3}
              defaultValue={settings.heroSubtitle}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h2 className="mb-4 text-sm font-medium">Butonlar</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Birincil Buton Metni">
            <input
              name="heroPrimaryLabel"
              required
              defaultValue={settings.heroPrimaryLabel}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="Birincil Buton Linki">
            <input
              name="heroPrimaryHref"
              required
              defaultValue={settings.heroPrimaryHref}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="İkincil Buton Metni">
            <input
              name="heroSecondaryLabel"
              required
              defaultValue={settings.heroSecondaryLabel}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="İkincil Buton Linki">
            <input
              name="heroSecondaryHref"
              required
              defaultValue={settings.heroSecondaryHref}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h2 className="mb-4 text-sm font-medium">Kişiye Özel Koleksiyon Bölümü</h2>
        {settings.campaignImageUrl && (
          <div className="relative mb-3 h-32 w-56 overflow-hidden border border-line">
            <Image
              src={settings.campaignImageUrl}
              alt=""
              fill
              sizes="224px"
              className="object-cover"
            />
          </div>
        )}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">
            Arka Plan Görseli (opsiyonel)
          </label>
          <input
            name="campaignImage"
            type="file"
            accept="image/*"
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </div>
        <div className="flex flex-col gap-4">
          <Field label="Üst Etiket">
            <input
              name="campaignEyebrow"
              required
              defaultValue={settings.campaignEyebrow}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="Başlık (yeni satır için Enter'a basın)">
            <textarea
              name="campaignHeading"
              required
              rows={2}
              defaultValue={settings.campaignHeading}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="Metin">
            <textarea
              name="campaignBody"
              required
              rows={3}
              defaultValue={settings.campaignBody}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="Buton Metni">
            <input
              name="campaignButtonLabel"
              required
              defaultValue={settings.campaignButtonLabel}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          Buton her zaman /kisiye-ozel sayfasına gider (ürünlerin gösterildiği sayfa).
        </p>
      </div>

      <div className="border-t border-line pt-6">
        <h2 className="mb-4 text-sm font-medium">El İşçiliği Bölümü</h2>
        {settings.engravingImageUrl && (
          <div className="relative mb-3 h-32 w-56 overflow-hidden border border-line">
            <Image
              src={settings.engravingImageUrl}
              alt=""
              fill
              sizes="224px"
              className="object-cover"
            />
          </div>
        )}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">
            Atölye Görseli (opsiyonel)
          </label>
          <input
            name="engravingImage"
            type="file"
            accept="image/*"
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </div>
        <div className="flex flex-col gap-4">
          <Field label="Üst Etiket">
            <input
              name="engravingEyebrow"
              required
              defaultValue={settings.engravingEyebrow}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="Başlık">
            <input
              name="engravingHeading"
              required
              defaultValue={settings.engravingHeading}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="Metin">
            <textarea
              name="engravingBody"
              required
              rows={3}
              defaultValue={settings.engravingBody}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="Buton Metni">
            <input
              name="engravingButtonLabel"
              required
              defaultValue={settings.engravingButtonLabel}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          Buton her zaman /gravur sayfasına gider (ürünlerin gösterildiği sayfa).
        </p>
      </div>

      <div className="border-t border-line pt-6">
        <h2 className="mb-4 text-sm font-medium">Sosyal Medya</h2>
        <div className="flex flex-col gap-4">
          <Field label="Instagram (tam link, opsiyonel)">
            <input
              name="instagramUrl"
              type="url"
              placeholder="https://instagram.com/kullaniciadi"
              defaultValue={settings.instagramUrl ?? ""}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="Facebook (tam link, opsiyonel)">
            <input
              name="facebookUrl"
              type="url"
              placeholder="https://facebook.com/sayfaadi"
              defaultValue={settings.facebookUrl ?? ""}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="Pinterest (tam link, opsiyonel)">
            <input
              name="pinterestUrl"
              type="url"
              placeholder="https://pinterest.com/kullaniciadi"
              defaultValue={settings.pinterestUrl ?? ""}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          Boş bırakılan sosyal medya ikonu sitede hiç gösterilmez.
        </p>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">{label}</label>
      {children}
    </div>
  );
}
