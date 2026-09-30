"use client";

import { useRef, type RefObject } from "react";
import { slugify } from "@/lib/utils";

export default function SlugField({
  name,
  defaultValue,
  sourceRef,
  disabled,
}: {
  name: string;
  defaultValue?: string;
  sourceRef: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink disabled:bg-ivory-deep disabled:text-ink-faint"
      />
      {!disabled && (
        <button
          type="button"
          title="Başlıktan otomatik SEO bağlantısı oluştur"
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.value = slugify(sourceRef.current?.value ?? "");
            }
          }}
          className="shrink-0 border border-ink px-3 text-sm hover:bg-ivory-deep"
        >
          ⟳
        </button>
      )}
    </div>
  );
}
