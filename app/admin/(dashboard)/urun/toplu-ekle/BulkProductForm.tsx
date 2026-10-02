"use client";

import { useActionState, useRef, useState } from "react";
import {
  bulkCreateWholesaleProducts,
  type BulkWholesaleActionState,
} from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";
import BarcodeScanButton from "./BarcodeScanButton";

const initialState: BulkWholesaleActionState = {};

let idCounter = 0;
function makeId(prefix: string) {
  idCounter += 1;
  return `${prefix}${idCounter}`;
}

export default function BulkProductForm() {
  const [state, formAction, pending] = useActionState(bulkCreateWholesaleProducts, initialState);
  const [rowIds, setRowIds] = useState<string[]>(() => [makeId("r")]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const addRow = () => setRowIds((ids) => [...ids, makeId("r")]);
  const removeRow = (id: string) =>
    setRowIds((ids) => (ids.length > 1 ? ids.filter((rowId) => rowId !== id) : ids));

  // Fotoğraflar Vercel'in sunucusuz fonksiyon isteklerinde ~4.5MB sabit boyut
  // sınırı var; birkaç telefon fotoğrafı bunu kolayca aşıp sunucu action'ını
  // hiç çalıştırmadan hataya yol açıyordu. Bu yüzden dosyaları önce tarayıcıdan
  // doğrudan Supabase Storage'a yüklüyoruz, action'a sadece path'leri gönderiyoruz.
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError(null);

    const rawFormData = new FormData(e.currentTarget);
    const payload = new FormData();
    const supabase = createClient();

    setUploading(true);
    for (const id of rowIds) {
      payload.append("rowIds", id);
      payload.set(`name-${id}`, String(rawFormData.get(`name-${id}`) ?? ""));
      payload.set(`sku-${id}`, String(rawFormData.get(`sku-${id}`) ?? ""));

      const files = rawFormData
        .getAll(`images-${id}`)
        .filter((f): f is File => f instanceof File && f.size > 0);

      for (const file of files) {
        const extension = file.name.split(".").pop() || "jpg";
        const path = `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
        const { error } = await supabase.storage.from("wholesale-images").upload(path, file);

        if (error) {
          setUploading(false);
          setUploadError(`Fotoğraf yüklenemedi: ${error.message}`);
          return;
        }

        payload.append(`imagePaths-${id}`, path);
      }
    }
    setUploading(false);

    formAction(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {rowIds.map((id, index) => (
        <ProductRow
          key={id}
          rowId={id}
          index={index}
          onRemove={rowIds.length > 1 ? () => removeRow(id) : undefined}
        />
      ))}

      <button
        type="button"
        onClick={addRow}
        className="w-fit border border-dashed border-ink px-6 py-3 text-xs font-medium tracking-[0.14em] uppercase hover:bg-ivory-deep"
      >
        + Ürün Satırı Ekle
      </button>

      {uploadError && <p className="text-xs text-status-red-fg">{uploadError}</p>}

      {state.results && state.results.length > 0 && (
        <div className="border border-line bg-ivory-deep p-4 text-xs">
          <div className="mb-2 font-medium tracking-wide text-ink uppercase">Sonuç</div>
          {state.results.map((result, index) => (
            <div
              key={index}
              className={result.error ? "text-status-red-fg" : "text-gold-deep"}
            >
              {result.name}: {result.error ? `Hata — ${result.error}` : "Kaydedildi ✓"}
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={pending || uploading}
        className="mt-1 w-fit bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
      >
        {uploading ? "Fotoğraflar yükleniyor..." : pending ? "Kaydediliyor..." : "Havuza Kaydet"}
      </button>
    </form>
  );
}

function ProductRow({
  rowId,
  index,
  onRemove,
}: {
  rowId: string;
  index: number;
  onRemove?: () => void;
}) {
  const [photoIds, setPhotoIds] = useState<string[]>(() => [makeId("p")]);
  const skuInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="border border-line bg-white p-5">
      <input type="hidden" name="rowIds" value={rowId} />
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-ink-soft uppercase">
          Ürün {index + 1}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-status-red-fg hover:opacity-70"
          >
            Satırı Sil
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ürün Adı">
          <input
            name={`name-${rowId}`}
            className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>
        <Field label="Ürün Kodu / Barkod">
          <div className="flex gap-2">
            <input
              ref={skuInputRef}
              name={`sku-${rowId}`}
              className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink"
            />
            <BarcodeScanButton
              onDetect={(code) => {
                if (skuInputRef.current) skuInputRef.current.value = code;
              }}
            />
          </div>
        </Field>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">
          Ürün Fotoğrafları (bilgisayardan seçin veya telefonda kameradan çekin — birden fazla kare ekleyebilirsiniz)
        </label>
        <div className="flex flex-col gap-2">
          {photoIds.map((photoId) => (
            <input
              key={photoId}
              name={`images-${rowId}`}
              type="file"
              accept="image/*"
              className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink"
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPhotoIds((ids) => [...ids, makeId("p")])}
          className="mt-2 border border-line px-4 py-2 text-[11px] font-medium tracking-wide uppercase hover:bg-ivory-deep"
        >
          + Fotoğraf Ekle
        </button>
      </div>
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
