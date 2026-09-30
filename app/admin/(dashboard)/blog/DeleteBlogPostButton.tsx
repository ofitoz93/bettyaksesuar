"use client";

import { deleteBlogPost } from "@/app/admin/actions";

export default function DeleteBlogPostButton({ id, title }: { id: string; title: string }) {
  return (
    <button
      type="button"
      className="text-xs tracking-wide text-status-red-fg hover:opacity-70"
      onClick={() => {
        if (confirm(`"${title}" yazısını silmek istediğinize emin misiniz?`)) {
          deleteBlogPost(id);
        }
      }}
    >
      Sil
    </button>
  );
}
