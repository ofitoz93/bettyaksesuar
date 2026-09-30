"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

function subscribeNoop() {
  return () => {};
}
function getBarcodeDetectorSupport() {
  return typeof window !== "undefined" && "BarcodeDetector" in window;
}
function getServerBarcodeDetectorSupport() {
  return false;
}

// Not: BarcodeDetector şu an sadece Chrome/Edge (Android dahil) tarafından destekleniyor.
// Desteklenmeyen tarayıcılarda buton "Kamera taraması desteklenmiyor" diyerek devre dışı kalır,
// kullanıcı barkodu her zaman elle de girebilir.
declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats?: string[] }) => {
      detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
    };
  }
}

export default function BarcodeScanButton({ onDetect }: { onDetect: (code: string) => void }) {
  const supported = useSyncExternalStore(
    subscribeNoop,
    getBarcodeDetectorSupport,
    getServerBarcodeDetectorSupport,
  );
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const onDetectRef = useRef(onDetect);

  useEffect(() => {
    onDetectRef.current = onDetect;
  }, [onDetect]);

  useEffect(() => {
    if (!scanning) return;

    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const detector = new window.BarcodeDetector!();
        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const results = await detector.detect(videoRef.current);
            if (results.length > 0) {
              onDetectRef.current(results[0].rawValue);
              stop();
              return;
            }
          } catch {
            // Kare okunamadı, bir sonraki karede tekrar denenecek.
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        if (!cancelled) {
          setError("Kameraya erişilemedi. Lütfen tarayıcı izinlerini kontrol edin.");
          setScanning(false);
        }
      }
    }

    function stop() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setScanning(false);
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [scanning]);

  if (!supported) {
    return (
      <span className="text-[11px] text-ink-soft">Bu tarayıcıda kamera ile barkod taraması desteklenmiyor</span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setScanning(true);
        }}
        className="shrink-0 border border-ink px-3 py-2.5 text-xs font-medium tracking-wide whitespace-nowrap uppercase hover:bg-ivory-deep"
      >
        Kamera ile Tara
      </button>

      {scanning && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/80 p-6">
          <video ref={videoRef} muted playsInline className="max-h-[70vh] w-full max-w-md bg-black" />
          <p className="text-xs text-white/80">Barkodu kameraya gösterin</p>
          <button
            type="button"
            onClick={() => setScanning(false)}
            className="bg-white px-6 py-2.5 text-xs font-medium tracking-wide uppercase"
          >
            İptal
          </button>
        </div>
      )}

      {error && <span className="text-[11px] text-status-red-fg">{error}</span>}
    </>
  );
}
