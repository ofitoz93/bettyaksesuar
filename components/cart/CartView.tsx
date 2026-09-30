"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { calculateShippingFee, type ShippingSettings } from "@/lib/shipping";

export default function CartView({ shippingSettings }: { shippingSettings: ShippingSettings }) {
  const { items, totalPrice, updateQuantity, removeItem } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = calculateShippingFee(totalPrice, itemCount, shippingSettings);
  const remainingForFreeShipping = Math.max(
    0,
    shippingSettings.freeShippingThreshold - totalPrice,
  );

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-6 text-sm text-ink-soft">Sepetiniz şu anda boş.</p>
        <Link
          href="/magaza"
          className="inline-block border border-ink px-8 py-3.5 text-xs tracking-[0.14em] uppercase hover:bg-ink hover:text-ivory"
        >
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_320px]">
      <div className="flex flex-col divide-y divide-line border-y border-line">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-5 py-5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-linear-to-br from-[#EDE3D2] to-[#D9C7A6]">
              {item.image && (
                <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
              )}
            </div>
            <div className="flex-1">
              <Link href={`/urun/${item.slug}`} className="text-sm hover:text-gold-deep">
                {item.name}
              </Link>
              <div className="mt-1 text-sm text-ink-soft">₺{item.price}</div>
            </div>
            <div className="flex items-center border border-line">
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="px-3 py-2 text-ink-soft hover:text-ink"
                aria-label="Azalt"
              >
                −
              </button>
              <span className="w-7 text-center text-sm">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                className="px-3 py-2 text-ink-soft hover:text-ink disabled:opacity-40"
                aria-label="Artır"
              >
                +
              </button>
            </div>
            <div className="w-20 text-right text-sm">₺{item.price * item.quantity}</div>
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-xs text-status-red-fg hover:opacity-70"
            >
              Sil
            </button>
          </div>
        ))}
      </div>

      <div className="h-fit border border-line p-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-ink-soft">Ara Toplam</span>
          <span>₺{totalPrice}</span>
        </div>
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="text-ink-soft">Kargo</span>
          <span>{shippingFee === 0 ? "Ücretsiz" : `₺${shippingFee}`}</span>
        </div>
        {remainingForFreeShipping > 0 && (
          <div className="mb-6 text-xs text-ink-faint">
            Ücretsiz kargoya ₺{remainingForFreeShipping} kaldı.
          </div>
        )}
        <Link
          href="/odeme"
          className="block bg-ink px-8 py-3.5 text-center text-xs font-medium tracking-[0.14em] text-ivory uppercase hover:bg-gold-deep"
        >
          Ödemeye Geç
        </Link>
      </div>
    </div>
  );
}
