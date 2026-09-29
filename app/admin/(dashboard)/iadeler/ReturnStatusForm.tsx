"use client";

import { useState, useTransition } from "react";
import { updateReturnRequestStatus } from "@/app/admin/actions";
import { RETURN_STATUSES, returnStatusLabel } from "@/lib/returns";

const STATUS_TONE: Record<string, string> = {
  beklemede: "bg-status-amber-bg text-status-amber-fg",
  onaylandi: "bg-status-green-bg text-status-green-fg",
  reddedildi: "bg-status-red-bg text-status-red-fg",
  tamamlandi: "bg-status-blue-bg text-status-blue-fg",
};

export default function ReturnStatusForm({
  requestId,
  status,
  adminNote,
}: {
  requestId: string;
  status: string;
  adminNote: string | null;
}) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [note, setNote] = useState(adminNote ?? "");
  const [, startTransition] = useTransition();

  const save = (nextStatus: string, nextNote: string) => {
    startTransition(() => {
      updateReturnRequestStatus(requestId, nextStatus, nextNote);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={currentStatus}
        onChange={(e) => {
          setCurrentStatus(e.target.value);
          save(e.target.value, note);
        }}
        className={`border-0 px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase outline-none ${
          STATUS_TONE[currentStatus] ?? ""
        }`}
      >
        {RETURN_STATUSES.map((s) => (
          <option key={s} value={s}>
            {returnStatusLabel(s)}
          </option>
        ))}
      </select>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => save(currentStatus, note)}
        placeholder="Admin notu (opsiyonel)"
        className="w-48 border border-line px-2.5 py-1.5 text-xs outline-none focus:border-ink"
      />
    </div>
  );
}
