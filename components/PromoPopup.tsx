"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import type { PromoPopupSettings } from "@/lib/data/promoPopup";
import type { Product } from "@/lib/types";
import { customerRegister, type AuthState } from "@/app/hesabim/actions";
import ProductCard from "@/components/ui/ProductCard";

const DISMISS_KEY = "verastone-promo-dismissed";
const initialState: AuthState = {};

export default function PromoPopup({
  settings,
  loggedIn,
  products = [],
}: {
  settings: PromoPopupSettings;
  loggedIn: boolean;
  products?: Product[];
}) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState("");
  const [state, formAction, pending] = useActionState(customerRegister, initialState);

  useEffect(() => {
    if (!settings.enabled || loggedIn) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, settings.delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [settings.enabled, settings.delaySeconds, loggedIn]);

  const close = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(settings.discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // panoya erişim yoksa sessizce yoksay
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 py-8 overflow-y-auto">
      <div className="relative w-full max-w-3xl overflow-hidden bg-white shadow-xl">
        <button
          type="button"
          onClick={close}
          aria-label="Kapat"
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-white"
        >
          ✕
        </button>

        <div className="grid md:grid-cols-2">
          <div>
            {settings.imageUrl && (
              <div className="relative h-48 w-full md:h-full md:min-h-[280px]">
                <Image src={settings.imageUrl} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
            )}

            <div className="p-7 text-center">
              <h2 className="font-display mb-2.5 text-2xl">{settings.title}</h2>
              <p className="mb-5 text-sm leading-relaxed text-ink-soft">{settings.body}</p>

              <button
                type="button"
                onClick={copyCode}
                className="w-full border border-dashed border-ink px-6 py-3 text-sm tracking-[0.1em] uppercase hover:bg-ivory-deep"
              >
                {copied ? "Kopyalandı ✓" : `${settings.discountCode} — ${settings.buttonLabel}`}
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-center border-t border-line p-7 md:border-t-0 md:border-l">
            {state.info ? (
              <div className="text-center">
                <div className="mb-3 text-2xl text-gold-deep">✓</div>
                <p className="text-sm text-ink-soft">{state.info}</p>
              </div>
            ) : (
              <>
                <h3 className="font-display mb-1 text-lg">Üye Ol, Kodu Kullan</h3>
                <p className="mb-4 text-xs text-ink-soft">
                  Hemen üye olun, indirim kodunuzu ilk siparişinizde kullanın.
                </p>
                <form action={formAction} className="flex flex-col gap-3">
                  <input
                    name="fullName"
                    required
                    placeholder="Ad Soyad"
                    autoComplete="name"
                    className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink"
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="E-posta"
                    autoComplete="email"
                    className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink"
                  />
                  <input
                    type="password"
                    name="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifre"
                    autoComplete="new-password"
                    className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink"
                  />
                  <input type="hidden" name="passwordConfirm" value={password} />

                  {state.error && <p className="text-xs text-status-red-fg">{state.error}</p>}

                  <button
                    type="submit"
                    disabled={pending}
                    className="mt-1 bg-ink px-6 py-3 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
                  >
                    {pending ? "Kaydediliyor..." : "Üye Ol"}
                  </button>
                </form>
                <Link
                  href="/hesabim/giris"
                  onClick={close}
                  className="mt-3 text-center text-xs text-ink-soft underline hover:text-ink"
                >
                  Zaten üye misiniz? Giriş yapın
                </Link>
              </>
            )}
          </div>
        </div>

        {products.length > 0 && (
          <div className="border-t border-line p-7">
            <h3 className="font-display mb-4 text-center text-base">Beğenebileceğiniz Ürünler</h3>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3" onClick={close}>
              {products.slice(0, 3).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
