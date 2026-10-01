"use client";

import { useEffect, useState } from "react";

export default function LogoSettings({
  siteName,
  siteTagline,
  logoUrl,
  logoHeight,
}: {
  siteName: string;
  siteTagline: string;
  logoUrl: string | null;
  logoHeight: number;
}) {
  const [previewSrc, setPreviewSrc] = useState<string | null>(logoUrl);
  const [height, setHeight] = useState(logoHeight);

  useEffect(() => {
    return () => {
      if (previewSrc && previewSrc.startsWith("blob:")) {
        URL.revokeObjectURL(previewSrc);
      }
    };
  }, [previewSrc]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewSrc(URL.createObjectURL(file));
  };

  return (
    <div className="mt-4">
      <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">
        Logo Görseli (opsiyonel)
      </label>
      <input
        name="logo"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
      />
      <p className="mt-1.5 text-xs text-ink-faint">
        Logo yüklerseniz site adı/alt başlık yerine header ve footer&apos;da bu görsel
        gösterilir.
      </p>

      <div className="mt-4 flex items-center gap-4">
        <label className="shrink-0 text-xs tracking-wide text-ink-soft">Logo Yüksekliği</label>
        <input
          type="range"
          min={24}
          max={160}
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          className="flex-1"
        />
        <input
          type="number"
          min={24}
          max={160}
          value={height}
          onChange={(e) => setHeight(Number(e.target.value) || 24)}
          className="w-20 border border-line bg-white px-2 py-1.5 text-sm outline-none focus:border-ink"
        />
        <span className="shrink-0 text-xs text-ink-faint">px</span>
      </div>
      <input type="hidden" name="logoHeight" value={height} />

      <div className="mt-5">
        <div className="mb-1.5 text-xs tracking-wide text-ink-soft">Ana Sayfa Önizleme</div>
        <div className="flex items-center justify-between gap-4 border border-line bg-ivory px-6 py-3">
          <div className="hidden gap-4 text-[11px] tracking-wide text-ink-soft sm:flex">
            <span>KOLYE</span>
            <span>KÜPE</span>
            <span>BİLEKLİK</span>
          </div>
          <div className="mx-auto text-center">
            {previewSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt=""
                style={{ height, width: "auto" }}
                className="mx-auto object-contain"
              />
            ) : (
              <>
                <div className="font-display text-lg tracking-[0.28em]">{siteName}</div>
                <div className="mt-0.5 text-[8px] tracking-[0.42em] text-gold-deep">
                  {siteTagline}
                </div>
              </>
            )}
          </div>
          <div className="hidden gap-3 text-ink-soft sm:flex">
            <span>♡</span>
            <span>☰</span>
          </div>
        </div>
        <p className="mt-1.5 text-xs text-ink-faint">
          Üst menüde (header) logonuzun gerçek boyutta nasıl görüneceğinin önizlemesi.
        </p>
      </div>
    </div>
  );
}
