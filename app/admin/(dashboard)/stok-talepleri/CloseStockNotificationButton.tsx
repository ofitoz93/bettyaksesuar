"use client";

import { useTransition } from "react";
import { closeStockNotification } from "@/app/admin/actions";

export default function CloseStockNotificationButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => closeStockNotification(id))}
      className="text-xs tracking-wide text-status-red-fg hover:opacity-70 disabled:opacity-40"
    >
      {pending ? "Kapatılıyor..." : "Kapat"}
    </button>
  );
}
