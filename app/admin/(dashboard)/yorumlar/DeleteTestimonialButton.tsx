"use client";

import { deleteTestimonial } from "@/app/admin/actions";

export default function DeleteTestimonialButton({ id, author }: { id: string; author: string }) {
  return (
    <button
      type="button"
      className="text-xs tracking-wide text-status-red-fg hover:opacity-70"
      onClick={() => {
        if (confirm(`"${author}" yorumunu silmek istediğinize emin misiniz?`)) {
          deleteTestimonial(id);
        }
      }}
    >
      Sil
    </button>
  );
}
