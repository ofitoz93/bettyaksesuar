"use client";

import { useEffect } from "react";

// PayTR, ödeme sonucu sayfalarını kendi iframe'inin içinde açar;
// bu bileşen sayfayı üst pencereye taşıyarak normal site görünümüne döner.
export default function IframeEscape() {
  useEffect(() => {
    if (window.top && window.top !== window.self) {
      window.top.location.href = window.location.href;
    }
  }, []);

  return null;
}
