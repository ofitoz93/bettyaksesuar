"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";

export default function CartLink({ solid }: { solid?: boolean }) {
  const { totalCount } = useCart();

  return (
    <Link href="/sepet" aria-label="Sepet" className="relative block">
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8h12l-1 12H7L6 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      {totalCount > 0 && (
        <span
          className={
            solid
              ? "absolute -top-1.5 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold-deep text-[9px] text-white"
              : "absolute -top-1.5 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold text-[9px] text-ink"
          }
        >
          {totalCount}
        </span>
      )}
    </Link>
  );
}
