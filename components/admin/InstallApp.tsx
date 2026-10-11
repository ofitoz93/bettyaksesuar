"use client";

import { useState, useSyncExternalStore } from "react";
import { promptInstall, useInstallState } from "@/lib/installPrompt";

type Platform = "ios" | "android" | "desktop" | "unknown";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
    return "ios";
  }
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

const noopSubscribe = () => () => {};
function usePlatform(): Platform {
  return useSyncExternalStore(noopSubscribe, detectPlatform, () => "unknown");
}

const DISMISS_KEY = "betty-admin-install-dismissed";

// Panelin üstünde, uygulama kurulabilir olduğunda çıkan ince şerit (Android / masaüstü Chrome)
export function InstallBanner() {
  const installState = useInstallState();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (installState !== "available" || dismissed) return null;

  return (
    <div className="flex items-center gap-3 border-b border-line bg-ink px-4 py-2.5 text-ivory sm:px-8">
      <span className="min-w-0 flex-1 text-xs">
        📲 <strong>Betty Admin</strong>&apos;i uygulama olarak yükleyin, siparişlerden anında haberiniz olsun.
      </span>
      <button
        type="button"
        onClick={() => void promptInstall()}
        className="shrink-0 bg-ivory px-3 py-1.5 text-[11px] font-medium tracking-wide text-ink uppercase hover:bg-gold-tint"
      >
        Yükle
      </button>
      <button
        type="button"
        aria-label="Kapat"
        onClick={() => {
          setDismissed(true);
          try {
            localStorage.setItem(DISMISS_KEY, "1");
          } catch {
            // depolama kapalıysa yalnızca bu oturumda gizlenir
          }
        }}
        className="shrink-0 px-1 text-sm text-ivory/70 hover:text-ivory"
      >
        ✕
      </button>
    </div>
  );
}

// Bildirimler sayfasındaki "Uygulama" kartı
export function InstallCard() {
  const installState = useInstallState();
  const platform = usePlatform();
  const [result, setResult] = useState<string | null>(null);

  // iPhone'da kurulum rehberi bildirim kartında gösteriliyor
  if (platform === "unknown" || (platform === "ios" && installState !== "installed")) return null;

  return (
    <section className="border border-line bg-white p-5">
      <h2 className="mb-3 text-xs font-medium tracking-wide text-ink-soft uppercase">Uygulama</h2>

      {installState === "installed" ? (
        <p className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full bg-status-green-fg" />
          Betty Admin bu cihazda uygulama olarak yüklü.
        </p>
      ) : installState === "available" ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-ink-soft">
            Paneli telefonunuza uygulama olarak yükleyin: ana ekranda kendi ikonuyla, tam ekran açılır.
          </p>
          <button
            type="button"
            onClick={async () => {
              const accepted = await promptInstall();
              setResult(
                accepted
                  ? "Yüklendi! Ana ekrandaki Betty Admin ikonundan açabilirsiniz."
                  : "Yükleme iptal edildi. İsterseniz tekrar deneyebilirsiniz.",
              );
            }}
            className="bg-ink px-6 py-3 text-xs font-medium tracking-[0.14em] text-ivory uppercase hover:bg-gold-deep"
          >
            📲 Uygulamayı Yükle
          </button>
        </div>
      ) : platform === "android" ? (
        <div className="text-sm">
          <p className="mb-2">Uygulamayı yüklemek için:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              Chrome&apos;da sağ üstteki <strong>⋮</strong> menüsüne dokunun.
            </li>
            <li>
              <strong>Uygulamayı yükle</strong> ya da <strong>Ana ekrana ekle</strong>&apos;yi seçin.
            </li>
          </ol>
          <p className="mt-2 text-xs text-ink-faint">
            Menüde bu seçenek yoksa uygulama zaten yüklü olabilir; uygulama listenizde Betty Admin&apos;i arayın.
          </p>
        </div>
      ) : (
        <p className="text-sm text-ink-soft">
          Bilgisayarda Chrome veya Edge adres çubuğunun sağındaki <strong>yükle</strong> simgesiyle
          paneli uygulama olarak açabilirsiniz.
        </p>
      )}

      {result && <p className="mt-3 text-xs text-ink-soft">{result}</p>}
    </section>
  );
}
