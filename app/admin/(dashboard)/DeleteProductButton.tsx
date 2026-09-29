"use client";

import { deleteProduct } from "@/app/admin/actions";

export default function DeleteProductButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  return (
    <button
      type="button"
      className="text-xs tracking-wide text-status-red-fg hover:opacity-70"
      onClick={() => {
        if (confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) {
          deleteProduct(id);
        }
      }}
    >
      Sil
    </button>
  );
}
