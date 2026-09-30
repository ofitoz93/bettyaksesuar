"use client";

import { useState, useTransition } from "react";

export default function SectionVisibilityToggle({
  initialEnabled,
  onToggle,
  label = "Sitede göster",
}: {
  initialEnabled: boolean;
  onToggle: (enabled: boolean) => Promise<void>;
  label?: string;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2.5 text-sm">
      <input
        type="checkbox"
        checked={enabled}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.checked;
          setEnabled(next);
          startTransition(() => {
            onToggle(next);
          });
        }}
        className="h-4 w-4"
      />
      {label}
    </label>
  );
}
