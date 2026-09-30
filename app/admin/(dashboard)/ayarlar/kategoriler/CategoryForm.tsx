"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import type { CategoryActionState } from "@/app/admin/actions";
import type { Category } from "@/lib/data/categories";
import RichTextEditor from "@/components/admin/RichTextEditor";
import SlugField from "@/components/admin/SlugField";

const initialState: CategoryActionState = {};

interface CategoryFormProps {
  action: (state: CategoryActionState, formData: FormData) => Promise<CategoryActionState>;
  category?: Category;
  otherCategories: Category[];
  submitLabel: string;
}

export default function CategoryForm({
  action,
  category,
  otherCategories,
  submitLabel,
}: CategoryFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [tab, setTab] = useState<"genel" | "veri">("genel");
  const nameRef = useRef<HTMLInputElement>(null);

  return (
    <form action={formAction} className="max-w-2xl">
      <div className="mb-6 flex gap-6 border-b border-line">
        {(["genel", "veri"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`border-b-2 pb-3 text-xs tracking-wide uppercase ${
              tab === t ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {t === "genel" ? "Genel" : "Veri"}
          </button>
        ))}
      </div>

      <div className={tab === "genel" ? "flex flex-col gap-5" : "hidden"}>
        <Field label="Kategori Adı">
          <input
            ref={nameRef}
            name="name"
            required
            defaultValue={category?.name}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>

        <Field label="Kategori Açıklaması (SEO açısından önemlidir — arama motorları bu metni okur)">
          <RichTextEditor name="description" defaultValue={category?.description} />
        </Field>

        <Field label="SEO Bağlantısı (slug)">
          <SlugField
            name="slug"
            defaultValue={category?.slug}
            sourceRef={nameRef}
            disabled={Boolean(category)}
          />
          {category && (
            <p className="mt-1.5 text-xs text-ink-faint">
              Var olan bir kategorinin bağlantısı, ürünlerle bağını bozmamak için
              değiştirilemez.
            </p>
          )}
        </Field>

        <Field label="Meta Başlığı">
          <input
            name="metaTitle"
            defaultValue={category?.metaTitle ?? ""}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>
        <Field label="Meta Açıklaması">
          <textarea
            name="metaDescription"
            rows={3}
            defaultValue={category?.metaDescription ?? ""}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>
        <Field label="Meta Anahtar Kelimeleri (virgülle ayırın)">
          <input
            name="metaKeywords"
            defaultValue={category?.metaKeywords ?? ""}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>
      </div>

      <div className={tab === "veri" ? "flex flex-col gap-5" : "hidden"}>
        <div>
          {category?.imageUrl && (
            <div className="relative mb-3 h-24 w-24 overflow-hidden border border-line">
              <Image src={category.imageUrl} alt="" fill sizes="96px" className="object-cover" />
            </div>
          )}
          <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">
            Kategori Görseli
          </label>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </div>

        <Field label="Üst Kategori (seçilmezse ana kategori olur)">
          <select
            name="parentSlug"
            defaultValue={category?.parentSlug ?? ""}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          >
            <option value="">— Ana Kategori —</option>
            {otherCategories
              .filter((c) => c.slug !== category?.slug)
              .map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
          </select>
        </Field>
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
