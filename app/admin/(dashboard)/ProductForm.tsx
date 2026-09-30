"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { setMainProductImage, type ActionState } from "@/app/admin/actions";
import type { Product } from "@/lib/types";
import type { ProductImageRow } from "@/lib/data/products";
import type { Category } from "@/lib/data/categories";
import RichTextEditor from "@/components/admin/RichTextEditor";
import SlugField from "@/components/admin/SlugField";

interface ProductFormProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  product?: Product;
  categories: Category[];
  existingImages?: ProductImageRow[];
  submitLabel: string;
}

const initialState: ActionState = {};
const TABS = ["genel", "veri", "baglanti", "resim"] as const;
const TAB_LABELS: Record<(typeof TABS)[number], string> = {
  genel: "Genel",
  veri: "Veri",
  baglanti: "Bağlantı",
  resim: "Resim",
};

export default function ProductForm({
  action,
  product,
  categories,
  existingImages = [],
  submitLabel,
}: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [tab, setTab] = useState<(typeof TABS)[number]>("genel");
  const [markedForDeletion, setMarkedForDeletion] = useState<string[]>([]);
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice?.toString() ?? "",
  );
  const nameRef = useRef<HTMLInputElement>(null);

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

  const sortedExistingImages = existingImages.slice().sort((a, b) => a.position - b.position);

  return (
    <form action={formAction} className="max-w-2xl">
      <div className="mb-6 flex gap-6 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`border-b-2 pb-3 text-xs tracking-wide uppercase ${
              tab === t ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* GENEL */}
      <div className={tab === "genel" ? "flex flex-col gap-5" : "hidden"}>
        <Field label="Ürün Adı">
          <input
            ref={nameRef}
            name="name"
            required
            defaultValue={product?.name}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>

        <Field label="Açıklama">
          <RichTextEditor name="description" defaultValue={product?.description ?? ""} />
        </Field>

        <Field label="SEO Bağlantısı (slug)">
          <SlugField name="slug" defaultValue={product?.slug} sourceRef={nameRef} />
          <p className="mt-1.5 text-xs text-ink-faint">
            Boş bırakılırsa isimden otomatik oluşturulur; sağdaki ⟳ ikonuyla da
            başlıktan yeniden üretebilirsiniz.
          </p>
        </Field>

        <Field label="Meta Başlığı">
          <input
            name="metaTitle"
            defaultValue={product?.metaTitle ?? ""}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>
        <Field label="Meta Açıklaması">
          <textarea
            name="metaDescription"
            rows={3}
            defaultValue={product?.metaDescription ?? ""}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>
        <Field label="Meta Anahtar Kelimeleri (virgülle ayırın)">
          <input
            name="metaKeywords"
            defaultValue={product?.metaKeywords ?? ""}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>

        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={product?.isActive ?? true}
            className="h-4 w-4"
          />
          Aktif (işaretli değilse ürün taslak olarak kalır, mağazada görünmez)
        </label>
      </div>

      {/* VERİ */}
      <div className={tab === "veri" ? "flex flex-col gap-5" : "hidden"}>
        <Field label="Ürün Kodu / Barkod (varsa barkod, yoksa ürün kodu)">
          <input
            name="sku"
            defaultValue={product?.sku ?? ""}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
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
          <Field label="Vergi Sınıfı (KDV %)">
            <input
              name="taxClassPercent"
              type="number"
              step="0.01"
              min="0"
              max="100"
              defaultValue={product?.taxClassPercent ?? 20}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
        </div>

        <Field label="Stok Adedi">
          <input
            name="stock"
            type="number"
            min="0"
            defaultValue={product?.stock ?? 0}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>

        <Field label="Alış Fiyatı (₺, opsiyonel — sadece kayıt için, sitede gösterilmez)">
          <input
            name="costPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.costPrice ?? ""}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>

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
      </div>

      {/* BAĞLANTI */}
      <div className={tab === "baglanti" ? "flex flex-col gap-5" : "hidden"}>
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
              <option key={category.slug} value={category.slug}>
                {category.parentSlug ? `— ${category.name}` : category.name}
              </option>
            ))}
          </select>
        </Field>
        <p className="text-xs text-ink-faint">
          Üretici seçimi Katalog &gt; Üreticiler eklendiğinde burada yer alacak.
        </p>
      </div>

      {/* RESİM */}
      <div className={tab === "resim" ? "flex flex-col gap-5" : "hidden"}>
        {sortedExistingImages.length > 0 ? (
          <Field label="Mevcut Fotoğraflar (ilki ana görseldir)">
            <div className="flex flex-wrap gap-3">
              {sortedExistingImages.map((image, index) => {
                const marked = markedForDeletion.includes(image.id);
                return (
                  <div key={image.id} className="relative">
                    <div
                      className={`relative h-20 w-20 overflow-hidden border ${
                        marked ? "border-status-red-fg opacity-40" : "border-line"
                      }`}
                    >
                      <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
                      {index === 0 && !marked && (
                        <span className="absolute top-0 left-0 bg-ink px-1.5 py-0.5 text-[9px] text-ivory">
                          Ana
                        </span>
                      )}
                    </div>
                    {marked && <input type="hidden" name="deleteImageIds" value={image.id} />}
                    <div className="mt-1 flex flex-col items-center gap-0.5">
                      {index !== 0 && !marked && product && (
                        <button
                          type="button"
                          onClick={() => setMainProductImage(product.id, image.id)}
                          className="text-center text-[10px] tracking-wide text-ink-soft hover:text-ink"
                        >
                          Ana Görsel Yap
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleDelete(image.id)}
                        className="block w-full text-center text-[10px] tracking-wide text-status-red-fg hover:opacity-70"
                      >
                        {marked ? "Geri Al" : "Sil"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Field>
        ) : null}

        {product ? (
          <Field label="Fotoğraf Ekle">
            <input
              name="images"
              type="file"
              accept="image/*"
              multiple
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
        ) : (
          <>
            <Field label="Ana Görsel">
              <input
                name="mainImage"
                type="file"
                accept="image/*"
                className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
              />
            </Field>
            <Field label="Diğer Görseller">
              <input
                name="galleryImages"
                type="file"
                accept="image/*"
                multiple
                className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
              />
            </Field>
          </>
        )}
      </div>

      {state.error && <p className="mt-5 text-xs text-status-red-fg">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-fit bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
      >
        {pending ? "Kaydediliyor..." : submitLabel}
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
