"use client";

import { deleteWholesaleProduct } from "@/app/admin/actions";

export default function DeleteWholesaleProductButton({
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
        if (confirm(`"${name}" ürününü havuzdan silmek istediğinize emin misiniz?`)) {
          deleteWholesaleProduct(id);
        }
      }}
    >
      Sil
    </button>
  );
}
