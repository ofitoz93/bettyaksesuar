"use client";

import { useTransition } from "react";
import { setCampaignEnabled } from "@/app/admin/actions";

export default function ToggleCampaignButton({
  id,
  enabled,
}: {
  id: string;
  enabled: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => setCampaignEnabled(id, !enabled))}
      className={`px-2 py-0.5 text-[10px] uppercase transition-colors disabled:opacity-50 ${
        enabled
          ? "bg-status-green-bg text-status-green-fg hover:opacity-70"
          : "bg-status-amber-bg text-status-amber-fg hover:opacity-70"
      }`}
    >
      {enabled ? "Aktif" : "Pasif"}
    </button>
  );
}
