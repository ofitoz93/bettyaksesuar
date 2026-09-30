"use client";

import { useEffect, useState } from "react";
import { createPaytrToken } from "@/app/odeme/actions";

export default function PaytrPaymentFrame({ orderId }: { orderId: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    createPaytrToken(orderId).then((result) => {
      if (cancelled) return;
      if (result.token) {
        setToken(result.token);
      } else {
        setError(result.error ?? "Ödeme başlatılamadı, lütfen tekrar deneyin.");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    if (!token) return;

    const script = document.createElement("script");
    script.src = "https://www.paytr.com/js/iframeResizer.min.js";
    script.async = true;
    script.onload = () => {
      const win = window as unknown as {
        iFrameResize?: (options: Record<string, unknown>, selector: string) => void;
      };
      win.iFrameResize?.({}, "#paytr-iframe");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [token]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <p className="mb-6 text-sm text-status-red-fg">{error}</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center text-sm text-ink-soft">
        Güvenli ödeme ekranı yükleniyor...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <p className="mb-4 text-center text-sm text-ink-soft">
        Kart bilgileriniz PayTR&apos;nin güvenli ödeme altyapısı üzerinden işlenir, tarafımızca
        görülmez ve saklanmaz.
      </p>
      <iframe
        id="paytr-iframe"
        src={`https://www.paytr.com/odeme/guvenli/${token}`}
        style={{ width: "100%", minHeight: 600, border: "none" }}
        title="Güvenli Ödeme"
      />
    </div>
  );
}
