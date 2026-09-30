"use client";

import { useState } from "react";
import type { NavLink } from "@/lib/data/siteSettings";

let idCounter = 0;
function makeId() {
  idCounter += 1;
  return `l${idCounter}`;
}

export default function LinkListEditor({
  name,
  defaultLinks,
}: {
  name: string;
  defaultLinks: NavLink[];
}) {
  const [rows, setRows] = useState(() =>
    defaultLinks.map((link) => ({ id: makeId(), ...link })),
  );

  const updateRow = (id: string, field: "label" | "href", value: string) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const removeRow = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id));
  };

  const json = JSON.stringify(rows.map(({ label, href }) => ({ label, href })));

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((row) => (
        <div key={row.id} className="flex gap-2">
          <input
            value={row.label}
            onChange={(e) => updateRow(row.id, "label", e.target.value)}
            placeholder="Etiket"
            className="w-1/2 border border-line bg-white px-3.5 py-2 text-sm outline-none focus:border-ink"
          />
          <input
            value={row.href}
            onChange={(e) => updateRow(row.id, "href", e.target.value)}
            placeholder="/hedef-adres"
            className="w-1/2 border border-line bg-white px-3.5 py-2 text-sm outline-none focus:border-ink"
          />
          <button
            type="button"
            onClick={() => removeRow(row.id)}
            className="shrink-0 px-2 text-xs text-status-red-fg hover:opacity-70"
          >
            Sil
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRows((current) => [...current, { id: makeId(), label: "", href: "" }])}
        className="w-fit border border-dashed border-ink px-4 py-2 text-[11px] font-medium tracking-wide uppercase hover:bg-ivory-deep"
      >
        + Link Ekle
      </button>
      <input type="hidden" name={name} value={json} />
    </div>
  );
}
