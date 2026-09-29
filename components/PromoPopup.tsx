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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 py-6 overflow-y-auto">
      <div className="relative w-full max-w-[340px] overflow-hidden rounded-lg bg-white shadow-xl">
        <button
          type="button"
          onClick={close}
          aria-label="Kapat"
          className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-white"
        >
          ✕
        </button>

        {settings.imageUrl && (
          <div className="relative h-28 w-full">
            <Image src={settings.imageUrl} alt="" fill sizes="340px" className="object-cover" />
          </div>
        )}

        <div className="p-5 text-center">
          <h2 className="font-display mb-1.5 text-lg">{settings.title}</h2>
          <p className="mb-4 text-xs leading-relaxed text-ink-soft">{settings.body}</p>

          <button
            type="button"
            onClick={copyCode}
            className="w-full border border-dashed border-ink px-4 py-2.5 text-xs tracking-[0.1em] uppercase hover:bg-ivory-deep"
          >
            {copied ? "Kopyalandı ✓" : `${settings.discountCode} — ${settings.buttonLabel}`}
          </button>

          <div className="mt-5 border-t border-line pt-5">
            {state.info ? (
              <div className="text-center">
                <div className="mb-2 text-xl text-gold-deep">✓</div>
                <p className="text-xs text-ink-soft">{state.info}</p>
              </div>
            ) : (
              <>
                <h3 className="font-display mb-3 text-sm">Üye Ol, Kodu Kullan</h3>
                <form action={formAction} className="flex flex-col gap-2.5">
                  <input
                    name="fullName"
                    required
                    placeholder="Ad Soyad"
                    autoComplete="name"
                    className="w-full border border-line bg-white px-3 py-2 text-xs outline-none focus:border-ink"
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="E-posta"
                    autoComplete="email"
                    className="w-full border border-line bg-white px-3 py-2 text-xs outline-none focus:border-ink"
                  />
                  <input
                    type="password"
                    name="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifre"
                    autoComplete="new-password"
                    className="w-full border border-line bg-white px-3 py-2 text-xs outline-none focus:border-ink"
                  />
                  <input type="hidden" name="passwordConfirm" value={password} />

                  {state.error && <p className="text-[11px] text-status-red-fg">{state.error}</p>}

                  <button
                    type="submit"
                    disabled={pending}
                    className="mt-0.5 bg-ink px-4 py-2.5 text-[11px] font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
                  >
                    {pending ? "Kaydediliyor..." : "Üye Ol"}
                  </button>
                </form>
                <Link
                  href="/hesabim/giris"
                  onClick={close}
                  className="mt-2.5 block text-center text-[11px] text-ink-soft underline hover:text-ink"
                >
                  Zaten üye misiniz? Giriş yapın
                </Link>
              </>
            )}
          </div>

          {products.length > 0 && (
            <div className="mt-5 border-t border-line pt-5">
              <h3 className="font-display mb-3 text-xs">Beğenebileceğiniz Ürünler</h3>
              <div className="grid grid-cols-3 gap-2.5" onClick={close}>
                {products.slice(0, 3).map((product) => (
                  <ProductCard key={product.id} product={product} compact />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
