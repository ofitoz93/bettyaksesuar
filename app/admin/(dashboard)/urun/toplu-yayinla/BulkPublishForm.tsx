"use client";

import { useActionState, useEffect, useState } from "react";
import { bulkCreateProducts, type BulkProductActionState } from "@/app/admin/actions";
import type { Category } from "@/lib/data/categories";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import RichTextEditor from "@/components/admin/RichTextEditor";

const initialState: BulkProductActionState = {};

let idCounter = 0;
function makeId() {
  idCounter += 1;
  return `u${idCounter}`;
}

export default function BulkPublishForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(bulkCreateProducts, initialState);
  const [rowIds, setRowIds] = useState<string[]>(() => [makeId()]);
  const [progress, setProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const addRow = () => {
    const id = makeId();
    setRowIds((ids) => [...ids, id]);
    // Yeni kartın adına odaklan
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>(`input[name="name-${id}"]`);
      input?.scrollIntoView({ behavior: "smooth", block: "center" });
      input?.focus({ preventScroll: true });
    }, 0);
  };
  const removeRow = (id: string) =>
    setRowIds((ids) => (ids.length > 1 ? ids.filter((rowId) => rowId !== id) : ids));

  // Başarıyla kaydedilen ürünlerin kartlarını kaldır, hatalılar düzeltilmek üzere kalsın
  // (yeni sonuç geldiğinde render sırasında ayarlanır)
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.results) {
      const failedRows = new Set(state.results.filter((r) => r.error).map((r) => r.rowId));
      const remaining = rowIds.filter((id) => failedRows.has(id));
      setRowIds(remaining.length > 0 ? remaining : [makeId()]);
    }
  }
  useEffect(() => {
    if (state.results) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state]);

  // Fotoğraflar tarayıcıdan doğrudan Supabase Storage'a yüklenir; action'a sadece
  // path'ler gider (Vercel'in ~4.5MB istek sınırı birkaç fotoğrafta aşılıyor).
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError(null);

    const raw = new FormData(e.currentTarget);
    const payload = new FormData();
    const supabase = createClient();

    const totalFiles = rowIds.reduce(
      (sum, id) =>
        sum +
        [raw.get(`mainImage-${id}`), ...raw.getAll(`galleryImages-${id}`)].filter(
          (f) => f instanceof File && f.size > 0,
        ).length,
      0,
    );
    let uploaded = 0;
    if (totalFiles > 0) setProgress(`Fotoğraflar yükleniyor (0/${totalFiles})...`);

    for (const id of rowIds) {
      payload.append("rowIds", id);
      for (const field of ["name", "description", "price", "stock", "category"]) {
        payload.set(`${field}-${id}`, String(raw.get(`${field}-${id}`) ?? ""));
      }

      const slug = slugify(String(raw.get(`name-${id}`) ?? "")) || "urun";
      // Ana görsel önce gelir (position 0)
      const isFile = (f: FormDataEntryValue | null): f is File => f instanceof File && f.size > 0;
      const mainFile = raw.get(`mainImage-${id}`);
      const files = [
        ...(isFile(mainFile) ? [{ file: mainFile, prefix: `${slug}-main` }] : []),
        ...raw.getAll(`galleryImages-${id}`).filter(isFile).map((file) => ({ file, prefix: slug })),
      ];

      for (const { file, prefix } of files) {
        const extension = file.name.split(".").pop() || "jpg";
        const path = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file);

        if (error) {
          // Bu gönderimde yüklenmiş fotoğrafları geri al, yarım iş kalmasın
          const alreadyUploaded = [...payload.entries()]
            .filter(([key]) => key.startsWith("imagePaths-"))
            .map(([, value]) => String(value));
          if (alreadyUploaded.length > 0) {
            await supabase.storage.from("product-images").remove(alreadyUploaded);
          }
          setProgress(null);
          setUploadError(`"${file.name}" yüklenemedi: ${error.message}`);
          return;
        }

        payload.append(`imagePaths-${id}`, path);
        uploaded += 1;
        setProgress(`Fotoğraflar yükleniyor (${uploaded}/${totalFiles})...`);
      }
    }

    setProgress(null);
    formAction(payload);
  }

  const busy = pending || progress !== null;
  const succeeded = state.results?.filter((r) => !r.error) ?? [];
  const failed = state.results?.filter((r) => r.error) ?? [];

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-5">
      {state.results && state.results.length > 0 && (
        <div className="border border-line bg-white p-4 text-sm">
          {succeeded.length > 0 && (
            <p className="text-status-green-fg">
              {succeeded.length} ürün mağazada yayına alındı ✓
              <span className="mt-1 block text-xs text-ink-soft">
                {succeeded.map((r) => r.name).join(", ")}
              </span>
            </p>
          )}
          {failed.length > 0 && (
            <div className={succeeded.length > 0 ? "mt-3" : ""}>
              <p className="text-status-red-fg">
                {failed.length} ürün kaydedilemedi — aşağıda düzeltip tekrar kaydedin:
              </p>
              <ul className="mt-1 list-disc pl-5 text-xs text-status-red-fg">
                {failed.map((r, i) => (
                  <li key={i}>
                    {r.name}: {r.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {rowIds.map((id, index) => (
        <ProductCard
          key={id}
          rowId={id}
          index={index}
          categories={categories}
          onRemove={rowIds.length > 1 ? () => removeRow(id) : undefined}
        />
      ))}

      <button
        type="button"
        onClick={addRow}
        disabled={busy}
        className="border border-dashed border-ink py-4 text-xs font-medium tracking-[0.14em] uppercase hover:bg-ivory-deep disabled:opacity-50"
      >
        + Yeni Ürün Ekle
      </button>

      {uploadError && <p className="text-xs text-status-red-fg">{uploadError}</p>}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-4 border-t border-line bg-ivory px-4 py-4 sm:mx-0 sm:px-0">
        <button
          type="submit"
          disabled={busy}
          className="bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
        >
          {progress ?? (pending ? "Kaydediliyor..." : `Kaydet ve Yayınla (${rowIds.length} ürün)`)}
        </button>
        <span className="text-xs text-ink-faint">
          SEO başlığı, açıklaması ve anahtar kelimeler ürün adı ve açıklamasından otomatik doldurulur.
        </span>
      </div>
    </form>
  );
}

function ProductCard({
  rowId,
  index,
  categories,
  onRemove,
}: {
  rowId: string;
  index: number;
  categories: Category[];
  onRemove?: () => void;
}) {
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // Önizleme URL'lerini bellekten temizle
  useEffect(() => () => {
    if (mainPreview) URL.revokeObjectURL(mainPreview);
  }, [mainPreview]);
  useEffect(() => () => galleryPreviews.forEach((url) => URL.revokeObjectURL(url)), [galleryPreviews]);

  const inputClass =
    "w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink";

  return (
    <div className="border border-line bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-ink-soft uppercase">
          Ürün {index + 1}
        </span>
        {onRemove && (
          <button type="button" onClick={onRemove} className="text-xs text-status-red-fg hover:opacity-70">
            Ürünü Kaldır
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <Field label="Ürün Adı *">
          <input name={`name-${rowId}`} required className={inputClass} />
        </Field>

        <Field label="Açıklama">
          <RichTextEditor name={`description-${rowId}`} />
        </Field>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Fiyat (₺) *">
            <input
              name={`price-${rowId}`}
              type="number"
              step="0.01"
              min="0"
              required
              inputMode="decimal"
              className={inputClass}
            />
          </Field>
          <Field label="Stok Adedi">
            <input
              name={`stock-${rowId}`}
              type="number"
              min="0"
              defaultValue={1}
              inputMode="numeric"
              className={inputClass}
            />
          </Field>
          <div className="col-span-2 sm:col-span-1">
            <Field label="Kategori *">
              <select name={`category-${rowId}`} required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Kategori seçin
                </option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.parentSlug ? `— ${category.name}` : category.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ana Görsel">
            <input
              name={`mainImage-${rowId}`}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setMainPreview(file ? URL.createObjectURL(file) : null);
              }}
              className={inputClass}
            />
            {mainPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainPreview} alt="" className="mt-2 h-24 w-24 border border-line object-cover" />
            )}
          </Field>
          <Field label="Diğer Görseller (birden fazla seçebilirsiniz)">
            <input
              name={`galleryImages-${rowId}`}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setGalleryPreviews(Array.from(e.target.files ?? []).map((f) => URL.createObjectURL(f)))
              }
              className={inputClass}
            />
            {galleryPreviews.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {galleryPreviews.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt="" className="h-16 w-16 border border-line object-cover" />
                ))}
              </div>
            )}
          </Field>
        </div>
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
