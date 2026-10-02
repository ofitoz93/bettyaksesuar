"use client";

import { useActionState, useEffect, useState } from "react";
import { updatePromoPopupSettings, type ActionState } from "@/app/admin/actions";
import type { PromoPopupSettings } from "@/lib/data/promoPopup";
import PromoPopupCard from "@/components/PromoPopupCard";

const initialState: ActionState = {};

export default function PromoPopupForm({ settings }: { settings: PromoPopupSettings }) {
  const [state, formAction, pending] = useActionState(updatePromoPopupSettings, initialState);

  const [title, setTitle] = useState(settings.title);
  const [body, setBody] = useState(settings.body);
  const [buttonLabel, setButtonLabel] = useState(settings.buttonLabel);
  const [discountCode, setDiscountCode] = useState(settings.discountCode);
  const [imagePreview, setImagePreview] = useState<string | null>(settings.imageUrl);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="mb-2 text-xs tracking-wide text-ink-soft uppercase">Önizleme</div>
        <div className="flex justify-center border border-line bg-ivory-deep p-6">
          <PromoPopupCard
            settings={{ title, body, buttonLabel, discountCode, imageUrl: imagePreview }}
            interactive={false}
          />
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" name="enabled" defaultChecked={settings.enabled} className="h-4 w-4" />
          Popup aktif
        </label>

        <Field label="Kaç saniye sonra gösterilsin">
          <input
            name="delaySeconds"
            type="number"
            min="3"
            required
            defaultValue={settings.delaySeconds}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>

        <Field label="Başlık">
          <input
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>

        <Field label="Metin">
          <textarea
            name="body"
            required
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Buton Metni">
            <input
              name="buttonLabel"
              required
              value={buttonLabel}
              onChange={(e) => setButtonLabel(e.target.value)}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="İndirim Kodu">
            <input
              name="discountCode"
              required
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
        </div>


        <div>
          <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">
            Kart Görseli (opsiyonel)
          </label>
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
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
    </div>
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
