"use client";

import { useState } from "react";

let idCounter = 0;
function makeId() {
  idCounter += 1;
  return `a${idCounter}`;
}

const MAX_MESSAGES = 5;

export default function AnnouncementListEditor({
  name,
  defaultTexts,
}: {
  name: string;
  defaultTexts: string[];
}) {
  const [rows, setRows] = useState(() =>
    (defaultTexts.length > 0 ? defaultTexts : [""]).map((text) => ({ id: makeId(), text })),
  );

  const updateRow = (id: string, text: string) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, text } : row)));
  };

  const removeRow = (id: string) => {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : current));
  };

  const json = JSON.stringify(rows.map((row) => row.text).filter((text) => text.trim() !== ""));

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((row) => (
        <div key={row.id} className="flex gap-2">
          <input
            value={row.text}
            onChange={(e) => updateRow(row.id, e.target.value)}
            placeholder="Örn. 1.000 TL ÜZERİ ÜCRETSİZ KARGO"
            className="w-full border border-line bg-white px-3.5 py-2 text-sm outline-none focus:border-ink"
          />
          <button
            type="button"
            onClick={() => removeRow(row.id)}
            disabled={rows.length <= 1}
            className="shrink-0 px-2 text-xs text-status-red-fg hover:opacity-70 disabled:opacity-30"
          >
            Sil
          </button>
        </div>
      ))}
      {rows.length < MAX_MESSAGES && (
        <button
          type="button"
          onClick={() => setRows((current) => [...current, { id: makeId(), text: "" }])}
          className="w-fit border border-dashed border-ink px-4 py-2 text-[11px] font-medium tracking-wide uppercase hover:bg-ivory-deep"
        >
          + Mesaj Ekle
        </button>
      )}
      <p className="text-xs text-ink-faint">
        20 saniyede bir sırayla döner, ziyaretçiler ok butonlarıyla elle de değiştirebilir. En
        fazla {MAX_MESSAGES} mesaj.
      </p>
      <input type="hidden" name={name} value={json} />
    </div>
  );
}
