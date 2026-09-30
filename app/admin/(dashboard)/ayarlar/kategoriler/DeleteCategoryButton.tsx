"use client";

import { deleteCategory } from "@/app/admin/actions";

export default function DeleteCategoryButton({ slug, name }: { slug: string; name: string }) {
  return (
    <button
      type="button"
      className="text-xs tracking-wide text-status-red-fg hover:opacity-70"
      onClick={async () => {
        if (!confirm(`"${name}" kategorisini tamamen silmek istediğinize emin misiniz?`)) return;
        const result = await deleteCategory(slug);
        if (result.error) alert(result.error);
      }}
    >
      Sil
    </button>
  );
}
