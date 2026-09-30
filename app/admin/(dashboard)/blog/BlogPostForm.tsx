"use client";

import { useActionState, useRef } from "react";
import Image from "next/image";
import type { ActionState } from "@/app/admin/actions";
import type { BlogPost } from "@/lib/data/blog";
import RichTextEditor from "@/components/admin/RichTextEditor";
import SlugField from "@/components/admin/SlugField";

const initialState: ActionState = {};

export default function BlogPostForm({
  action,
  post,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  post?: BlogPost;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const titleRef = useRef<HTMLInputElement>(null);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <Field label="Başlık">
        <input
          ref={titleRef}
          name="title"
          required
          defaultValue={post?.title}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <Field label="SEO Bağlantısı (slug)">
        <SlugField
          name="slug"
          defaultValue={post?.slug}
          sourceRef={titleRef}
          disabled={Boolean(post)}
        />
      </Field>

      <Field label="Anahtar Kelimeler / Özet (liste sayfasında gösterilir)">
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={post?.excerpt ?? ""}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <div>
        {post?.imageUrl && (
          <div className="relative mb-3 h-32 w-56 overflow-hidden border border-line">
            <Image src={post.imageUrl} alt="" fill sizes="224px" className="object-cover" />
          </div>
        )}
        <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">Görsel</label>
        <input
          name="image"
          type="file"
          accept="image/*"
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>

      <Field label="Yazar">
        <input
          name="author"
          defaultValue={post?.author ?? ""}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <Field label="İçerik">
        <RichTextEditor name="content" defaultValue={post?.content ?? ""} />
      </Field>

      <Field label="Meta Başlığı">
        <input
          name="metaTitle"
          defaultValue={post?.metaTitle ?? ""}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>
      <Field label="Meta Açıklaması">
        <textarea
          name="metaDescription"
          rows={3}
          defaultValue={post?.metaDescription ?? ""}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>
      <Field label="Meta Anahtar Kelimeleri (virgülle ayırın)">
        <input
          name="metaKeywords"
          defaultValue={post?.metaKeywords ?? ""}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={post?.isPublished ?? false}
          className="h-4 w-4"
        />
        Yayınla (işaretlenmezse taslak olarak kalır)
      </label>

      {state.error && <p className="text-xs text-status-red-fg">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-fit bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
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
