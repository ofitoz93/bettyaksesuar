"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const stock = product.stock ?? 0;
  const outOfStock = stock <= 0;

  const handleAdd = () => {
    if (outOfStock) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center border border-line">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={outOfStock}
          className="px-3.5 py-3 text-ink-soft hover:text-ink disabled:opacity-40"
          aria-label="Azalt"
        >
          −
        </button>
        <span className="w-8 text-center text-sm">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
          disabled={outOfStock || quantity >= stock}
          className="px-3.5 py-3 text-ink-soft hover:text-ink disabled:opacity-40"
          aria-label="Artır"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        className="inline-flex items-center justify-center gap-2 border border-ink bg-ink px-8 py-4 font-sans text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors duration-200 whitespace-nowrap hover:bg-gold-deep hover:border-gold-deep disabled:cursor-not-allowed disabled:opacity-40"
      >
        {outOfStock ? "Stokta Yok" : added ? "Sepete Eklendi ✓" : "Sepete Ekle"}
      </button>
    </div>
  );
}
