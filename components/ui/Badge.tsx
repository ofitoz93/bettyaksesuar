import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "dark" | "gold";
}

export default function Badge({ children, tone = "dark" }: BadgeProps) {
  const toneClasses =
    tone === "gold"
      ? "bg-gold-deep text-white"
      : "bg-ink text-ivory";

  return (
    <span
      className={`absolute top-2.5 left-2.5 px-2 py-1 text-[9.5px] tracking-[0.08em] ${toneClasses}`}
    >
      {children}
    </span>
  );
}
