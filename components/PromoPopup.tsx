"use client";

import { useEffect, useState } from "react";
import type { PromoPopupSettings } from "@/lib/data/promoPopup";
import type { Product } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import PromoPopupCard from "@/components/PromoPopupCard";

const DISMISS_KEY = "verastone-promo-dismissed";

export default function PromoPopup({
  settings,
  products = [],
}: {
  settings: PromoPopupSettings;
  products?: Product[];
}) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!settings.enabled) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled || user) return;
      timer = setTimeout(() => {
        setVisible(true);
      }, settings.delaySeconds * 1000);
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [settings.enabled, settings.delaySeconds]);

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
      <div className="relative" onClick={close}>
        <button
          type="button"
          onClick={close}
          aria-label="Kapat"
          className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-white"
        >
          ✕
        </button>
        <div onClick={(e) => e.stopPropagation()}>
          <PromoPopupCard
            settings={settings}
            products={products}
            copied={copied}
            onCodeClick={copyCode}
          />
        </div>
      </div>
    </div>
  );
}
