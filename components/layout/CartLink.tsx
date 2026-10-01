"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart/CartContext";

export default function CartLink({ solid }: { solid?: boolean }) {
  const { items, totalCount, totalPrice, removeItem } = useCart();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Sepet"
        aria-expanded={open}
        className="relative block"
      >
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
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-3 w-80 border border-line bg-white p-4 text-ink shadow-xl">
          {items.length === 0 ? (
            <p className="py-6 text-center text-xs text-ink-soft">Sepetiniz boş.</p>
          ) : (
            <>
              <div className="flex max-h-72 flex-col gap-3 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-ivory-deep">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs">{item.name}</div>
                      <div className="text-[11px] text-ink-soft">
                        {item.quantity} × ₺{item.price}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      aria-label="Kaldır"
                      className="shrink-0 text-ink-faint hover:text-status-red-fg"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm">
                <span className="text-ink-soft">Toplam</span>
                <span>₺{totalPrice}</span>
              </div>
              <Link
                href="/sepet"
                onClick={() => setOpen(false)}
                className="mt-3 block bg-ink px-4 py-2.5 text-center text-[11px] font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep"
              >
                Sepete Git
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
