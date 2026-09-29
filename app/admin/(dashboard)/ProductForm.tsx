"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import type { ActionState } from "@/app/admin/actions";
import type { Product } from "@/lib/types";
import type { ProductImageRow } from "@/lib/data/products";
import { categoryLabels } from "@/components/ui/CategoryIcon";

const categories = Object.keys(categoryLabels) as (keyof typeof categoryLabels)[];

interface ProductFormProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  product?: Product;
  existingImages?: ProductImageRow[];
  submitLabel: string;
}

const initialState: ActionState = {};

export default function ProductForm({
  action,
  product,
  existingImages = [],
  submitLabel,
}: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [markedForDeletion, setMarkedForDeletion] = useState<string[]>([]);
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice?.toString() ?? "",
  );

  const priceNum = Number(price);
  const compareNum = Number(compareAtPrice);
  const computedDiscount =
    compareAtPrice && priceNum > 0 && compareNum > priceNum
      ? Math.round(((compareNum - priceNum) / compareNum) * 100)
      : null;

  const toggleDelete = (id: string) => {
    setMarkedForDeletion((current) =>
      current.includes(id) ? current.filter((imgId) => imgId !== id) : [...current, id],
    );
  };

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <Field label="Ürün Adı">
        <input
          name="name"
          required
          defaultValue={product?.name}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <Field label="Slug (boş bırakılırsa isimden otomatik oluşturulur)">
        <input
          name="slug"
          defaultValue={product?.slug}
          placeholder="orn-zincir-kolye"
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <Field label="Kategori">
        <select
          name="category"
          required
          defaultValue={product?.category ?? ""}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        >
          <option value="" disabled>
            Kategori seçin
          </option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {categoryLabels[category]}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-5">
        <Field label="Fiyat (₺)">
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>
        <Field label="Stok Adedi">
          <input
            name="stock"
            type="number"
            min="0"
            defaultValue={product?.stock ?? 0}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>
      </div>

      <Field label="Eski Fiyat (₺, opsiyonel — indirim rozeti ve yüzdesi buradan otomatik hesaplanır)">
        <input
          name="compareAtPrice"
          type="number"
          step="0.01"
          min="0"
          value={compareAtPrice}
          onChange={(e) => setCompareAtPrice(e.target.value)}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
        {computedDiscount !== null && (
          <p className="mt-1.5 text-xs text-gold-deep">
            %{computedDiscount} indirimli olarak gösterilecek (₺{compareAtPrice} → ₺{price})
          </p>
        )}
      </Field>

      <Field label="Açıklama">
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <Field label="Ürün Fotoğrafları">
        {existingImages.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {existingImages.map((image) => {
              const marked = markedForDeletion.includes(image.id);
              return (
                <div key={image.id} className="relative">
                  <div
                    className={`relative h-20 w-20 overflow-hidden border ${
                      marked ? "border-status-red-fg opacity-40" : "border-line"
                    }`}
                  >
                    <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
                  </div>
                  {marked && (
                    <input type="hidden" name="deleteImageIds" value={image.id} />
                  )}
                  <button
                    type="button"
                    onClick={() => toggleDelete(image.id)}
                    className="mt-1 block w-full text-center text-[10px] tracking-wide text-status-red-fg hover:opacity-70"
                  >
                    {marked ? "Geri Al" : "Sil"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <input
          name="images"
          type="file"
          accept="image/*"
          multiple
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
        <p className="mt-1.5 text-xs text-ink-faint">
          Birden fazla fotoğraf seçebilirsiniz, ilk fotoğraf ürün kartında kapak görseli olarak kullanılır.
        </p>
      </Field>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="isNew"
            defaultChecked={product?.isNew}
            className="h-4 w-4"
          />
          Yeni ürün olarak işaretle
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="isBestSeller"
            defaultChecked={product?.isBestSeller}
            className="h-4 w-4"
          />
          Çok satanlarda göster
        </label>
      </div>

      {state.error && (
        <p className="text-xs text-status-red-fg">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
      >
        {pending ? "Kaydediliyor..." : submitLabel}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">
        {label}
      </label>
      {children}
    </div>
  );
}
