"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { createClient } from "@/lib/supabase/client";
import { createOrder, type CheckoutState } from "@/app/odeme/actions";
import { calculateShippingFee, type ShippingSettings } from "@/lib/shipping";
import type { CurrentProfile } from "@/lib/data/profile";
import type { PaymentMethod } from "@/lib/data/paymentMethods";
import PaytrPaymentFrame from "./PaytrPaymentFrame";

const initialState: CheckoutState = {};

interface CheckoutFormProps {
  shippingSettings: ShippingSettings;
  profile: CurrentProfile | null;
  paymentMethods: PaymentMethod[];
}

export default function CheckoutForm({ shippingSettings, profile, paymentMethods }: CheckoutFormProps) {
  const { items, totalPrice, clear, removeItem, updateQuantity } = useCart();
  const [state, formAction, pending] = useActionState(createOrder, initialState);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = calculateShippingFee(totalPrice, itemCount, shippingSettings);
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]?.code ?? "");
  const activeMethod = paymentMethods.find((m) => m.code === selectedMethod);
  const paymentDiscount = activeMethod
    ? Math.round(((totalPrice * activeMethod.extraDiscountPercent) / 100) * 100) / 100
    : 0;

  // Sepetteki ürünleri veritabanıyla karşılaştırıp silinmiş ürünleri kaldırır,
  // stoktan fazla adetleri kırpar — "Ürün bulunamadı" hatasını sipariş
  // verilmeden önce önler.
  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    let cancelled = false;

    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("id, stock")
        .in(
          "id",
          items.map((item) => item.productId),
        );

      if (cancelled) return;

      const stockById = new Map((data ?? []).map((row) => [row.id, row.stock as number]));
      const removed: string[] = [];
      const adjusted: string[] = [];

      for (const item of items) {
        const stock = stockById.get(item.productId);
        if (stock === undefined) {
          removed.push(item.name);
          removeItem(item.productId);
        } else if (stock <= 0) {
          removed.push(item.name);
          removeItem(item.productId);
        } else if (item.quantity > stock) {
          adjusted.push(item.name);
          updateQuantity(item.productId, stock);
        }
      }

      if (removed.length > 0) {
        setCartNotice(
          `${removed.join(", ")} artık mevcut olmadığı için sepetinizden kaldırıldı.`,
        );
      } else if (adjusted.length > 0) {
        setCartNotice(`${adjusted.join(", ")} için stok adediniz güncellendi.`);
      }

      setValidated(true);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const itemsJson = useMemo(
    () =>
      JSON.stringify(
        items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      ),
    [items],
  );

  useEffect(() => {
    if (state.order) {
      clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.order]);

  if (state.order) {
    if (state.order.paymentMethod === "kredi_karti") {
      return <PaytrPaymentFrame orderId={state.order.id} />;
    }

    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <div className="mb-3 text-2xl text-gold-deep">✓</div>
        <h2 className="font-display mb-2 text-2xl">Siparişiniz Alındı</h2>
        <p className="mb-1 text-sm text-ink-soft">
          Sipariş numaranız: <span className="text-ink">{state.order.orderNumber}</span>
        </p>
        {state.order.discountAmount > 0 && (
          <p className="mb-1 text-sm text-status-green-fg">
            İndirim uygulandı: -₺{state.order.discountAmount}
          </p>
        )}
        {state.order.paymentDiscountAmount > 0 && (
          <p className="mb-1 text-sm text-status-green-fg">
            Ödeme yöntemi indirimi: -₺{state.order.paymentDiscountAmount}
          </p>
        )}
        <p className="mb-8 text-sm text-ink-soft">
          Toplam tutar: <span className="text-ink">₺{state.order.total}</span>
        </p>
        <Link
          href={profile ? "/hesabim/siparislerim" : "/magaza"}
          className="inline-block border border-ink px-8 py-3.5 text-xs tracking-[0.14em] uppercase hover:bg-ink hover:text-ivory"
        >
          {profile ? "Siparişlerimi Görüntüle" : "Alışverişe Devam Et"}
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-6 text-sm text-ink-soft">Sepetiniz boş, ödeme adımına geçemezsiniz.</p>
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
      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="items" value={itemsJson} />

        {cartNotice && (
          <div className="border border-status-amber-bg bg-status-amber-bg px-4 py-3 text-xs text-status-amber-fg">
            {cartNotice}
          </div>
        )}

        {profile && (
          <div className="border border-line bg-ivory-deep px-4 py-3 text-xs text-ink-soft">
            <span className="text-ink">{profile.fullName || profile.email}</span> hesabıyla
            sipariş veriyorsunuz.
          </div>
        )}

        <div className="grid grid-cols-2 gap-5">
          <Field label="Ad Soyad">
            <input
              name="name"
              required
              defaultValue={profile?.fullName ?? ""}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="Telefon">
            <input
              name="phone"
              type="tel"
              required
              defaultValue={profile?.phone ?? ""}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </Field>
        </div>

        <Field label="E-posta">
          <input
            name="email"
            type="email"
            required
            defaultValue={profile?.email ?? ""}
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>

        <Field label="Teslimat Adresi">
          <textarea
            name="address"
            required
            rows={4}
            placeholder="Mahalle, cadde/sokak, no, ilçe/il, posta kodu"
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>

        <div>
          <label className="mb-2 block text-xs tracking-wide text-ink-soft">Ödeme Yöntemi</label>
          <div className="flex flex-col gap-2.5">
            {paymentMethods.map((method) => (
              <label
                key={method.code}
                className="flex items-center justify-between gap-2.5 border border-line px-4 py-3 text-sm has-[:checked]:border-ink"
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.code}
                    checked={selectedMethod === method.code}
                    onChange={() => setSelectedMethod(method.code)}
                  />
                  {method.label}
                </span>
                {method.extraDiscountPercent > 0 && (
                  <span className="text-xs text-status-green-fg">
                    %{method.extraDiscountPercent} indirim
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        <Field label={profile ? "İndirim Kodu (opsiyonel)" : "İndirim Kodu (üye girişi gerektirir)"}>
          <input
            name="discountCode"
            placeholder="Örn: HOSGELDIN10"
            className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </Field>

        <label className="flex items-start gap-2.5 text-xs text-ink-soft">
          <input type="checkbox" name="termsAccepted" required className="mt-0.5" />
          <span>
            <Link
              href="/mesafeli-satis-sozlesmesi"
              target="_blank"
              className="text-ink underline hover:text-gold-deep"
            >
              Mesafeli Satış Sözleşmesi
            </Link>
            &apos;ni ve{" "}
            <Link
              href="/on-bilgilendirme-formu"
              target="_blank"
              className="text-ink underline hover:text-gold-deep"
            >
              Ön Bilgilendirme Formu
            </Link>
            &apos;nu okudum, kabul ediyorum.
          </span>
        </label>

        {paymentMethods.length === 0 && (
          <p className="text-xs text-status-red-fg">
            Şu anda aktif bir ödeme yöntemi bulunmuyor, lütfen daha sonra tekrar deneyin.
          </p>
        )}

        {state.error && <p className="text-xs text-status-red-fg">{state.error}</p>}

        <button
          type="submit"
          disabled={pending || !validated || paymentMethods.length === 0}
          className="mt-2 bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
        >
          {pending ? "Sipariş Oluşturuluyor..." : "Siparişi Onayla"}
        </button>
      </form>

      <div className="h-fit border border-line p-6">
        <div className="mb-4 text-xs tracking-[0.14em] text-ink-soft uppercase">Sipariş Özeti</div>
        <div className="flex flex-col gap-2.5">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span className="text-ink-soft">
                {item.name} × {item.quantity}
              </span>
              <span>₺{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-line pt-3 text-sm">
          <span className="text-ink-soft">Ara Toplam</span>
          <span>₺{totalPrice}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-ink-soft">Kargo</span>
          <span>{shippingFee === 0 ? "Ücretsiz" : `₺${shippingFee}`}</span>
        </div>
        {paymentDiscount > 0 && (
          <div className="mt-2 flex justify-between text-sm text-status-green-fg">
            <span>{activeMethod?.label} indirimi (%{activeMethod?.extraDiscountPercent})</span>
            <span>-₺{paymentDiscount}</span>
          </div>
        )}
        <div className="mt-3 flex justify-between border-t border-line pt-3 text-sm">
          <span>Toplam</span>
          <span>₺{totalPrice + shippingFee - paymentDiscount}</span>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">{label}</label>
      {children}
    </div>
  );
}
