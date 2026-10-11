"use client";

import { useEffect, useState, useTransition } from "react";
import {
  deletePushSubscription,
  savePushSubscription,
  sendTestPush,
  updatePushPrefs,
  type PushPrefs,
} from "@/app/admin/push-actions";

export interface DeviceRow extends PushPrefs {
  id: string;
  endpoint: string;
  device_name: string | null;
  created_at: string;
  last_used_at: string | null;
}

type Support = "checking" | "ok" | "ios-install" | "ios-update" | "unsupported";

const PREF_LABELS: { key: keyof PushPrefs; label: string; hint: string }[] = [
  {
    key: "notify_new_order",
    label: "Yeni sipariş",
    hint: "Havale ve kapıda ödemede hemen, kartla ödemede ödeme onaylanınca",
  },
  { key: "notify_order_cancelled", label: "Sipariş iptali", hint: "Müşteri siparişini iptal edince" },
  { key: "notify_return_request", label: "İade talebi", hint: "Müşteri iade talebi oluşturunca" },
  { key: "notify_stock_request", label: "Stok talebi", hint: "Biri \"Gelince haber ver\" deyince" },
  { key: "notify_low_stock", label: "Stok azaldı", hint: "Satıştan sonra ürün stoğu 5 ve altına düşünce" },
];

const SW_URL = "/admin-sw.js";
const SW_SCOPE = "/admin";

function base64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

function isIos() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function describeDevice() {
  const ua = navigator.userAgent;
  const device = /iPhone/.test(ua)
    ? "iPhone"
    : /iPad/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
      ? "iPad"
      : /Android/.test(ua)
        ? "Android"
        : /Mac/.test(ua)
          ? "Mac"
          : /Windows/.test(ua)
            ? "Windows"
            : "Cihaz";
  const browser = isStandalone()
    ? "uygulama"
    : /Edg\//.test(ua)
      ? "Edge"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : "tarayıcı";
  return `${device} · ${browser}`;
}

export default function PushSettings({
  devices,
  vapidPublicKey,
}: {
  devices: DeviceRow[];
  vapidPublicKey: string;
}) {
  const [support, setSupport] = useState<Support>("checking");
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    (async () => {
      const hasPush = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      if (!hasPush) {
        if (isIos()) setSupport(isStandalone() ? "ios-update" : "ios-install");
        else setSupport("unsupported");
        return;
      }
      if (isIos() && !isStandalone()) {
        setSupport("ios-install");
        return;
      }
      const registration = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
      const subscription = await registration.pushManager.getSubscription();
      setPermission(Notification.permission);
      setEndpoint(subscription?.endpoint ?? null);
      setSupport("ok");
    })().catch(() => setSupport("unsupported"));
  }, []);

  const currentDevice = devices.find((d) => d.endpoint === endpoint) ?? null;
  const otherDevices = devices.filter((d) => d.endpoint !== endpoint);

  async function enable() {
    setBusy(true);
    setMessage(null);
    try {
      if (!vapidPublicKey) throw new Error("Sunucuda NEXT_PUBLIC_VAPID_PUBLIC_KEY tanımlı değil.");
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") {
        throw new Error(
          "Bildirim izni verilmedi. Telefon Ayarlar > Bildirimler > Betty Admin bölümünden izin verebilirsiniz.",
        );
      }
      const registration = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
      await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64ToUint8Array(vapidPublicKey),
        }));
      const json = subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const saved = await savePushSubscription(json, describeDevice());
      if (saved.error) throw new Error(saved.error);
      setEndpoint(subscription.endpoint);
      const test = await sendTestPush(subscription.endpoint);
      setMessage(
        test.error
          ? { tone: "error", text: test.error }
          : { tone: "ok", text: "Bildirimler açıldı. Birkaç saniye içinde bir test bildirimi gelecek." },
      );
    } catch (err) {
      setMessage({ tone: "error", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setMessage(null);
    try {
      const registration = await navigator.serviceWorker.getRegistration(SW_SCOPE);
      const subscription = await registration?.pushManager.getSubscription();
      await subscription?.unsubscribe();
      if (currentDevice) await deletePushSubscription(currentDevice.id);
      setEndpoint(null);
      setMessage({ tone: "ok", text: "Bu cihazda bildirimler kapatıldı." });
    } catch (err) {
      setMessage({ tone: "error", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    if (!endpoint) return;
    setBusy(true);
    setMessage(null);
    const result = await sendTestPush(endpoint);
    setMessage(result.error ? { tone: "error", text: result.error } : { tone: "ok", text: "Test bildirimi gönderildi." });
    setBusy(false);
  }

  function togglePref(key: keyof PushPrefs, value: boolean) {
    if (!currentDevice || !endpoint) return;
    const prefs = Object.fromEntries(PREF_LABELS.map(({ key: k }) => [k, currentDevice[k]])) as unknown as PushPrefs;
    prefs[key] = value;
    startTransition(async () => {
      const result = await updatePushPrefs(endpoint, prefs);
      if (result.error) setMessage({ tone: "error", text: result.error });
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="border border-line bg-white p-5">
        <h2 className="mb-3 text-xs font-medium tracking-wide text-ink-soft uppercase">Bu cihaz</h2>

        {support === "checking" && <p className="text-sm text-ink-soft">Kontrol ediliyor...</p>}

        {support === "ios-install" && <IosInstallGuide />}

        {support === "ios-update" && (
          <p className="text-sm">
            Bildirimler için iPhone&apos;unuzu <strong>iOS 16.4 veya üstüne</strong> güncelleyin
            (Ayarlar → Genel → Yazılım Güncelleme).
          </p>
        )}

        {support === "unsupported" && (
          <p className="text-sm">
            Bu tarayıcı bildirimleri desteklemiyor. Telefonda Safari (iPhone) veya Chrome (Android),
            bilgisayarda Chrome, Edge ya da Safari kullanın.
          </p>
        )}

        {support === "ok" && (
          <>
            {endpoint && currentDevice ? (
              <div className="flex flex-col gap-4">
                <p className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-status-green-fg" />
                  Bildirimler açık · {currentDevice.device_name ?? "Bu cihaz"}
                </p>
                <div className="flex flex-col divide-y divide-line border-y border-line">
                  {PREF_LABELS.map(({ key, label, hint }) => (
                    <label key={key} className="flex cursor-pointer items-center justify-between gap-4 py-3">
                      <span>
                        <span className="block text-sm">{label}</span>
                        <span className="block text-xs text-ink-faint">{hint}</span>
                      </span>
                      <input
                        type="checkbox"
                        defaultChecked={currentDevice[key]}
                        onChange={(e) => togglePref(key, e.target.checked)}
                        className="h-5 w-5 shrink-0 accent-ink"
                      />
                    </label>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={test}
                    disabled={busy}
                    className="border border-ink px-5 py-2.5 text-xs font-medium tracking-[0.12em] uppercase hover:bg-ivory-deep disabled:opacity-50"
                  >
                    Test Bildirimi Gönder
                  </button>
                  <button
                    type="button"
                    onClick={disable}
                    disabled={busy}
                    className="px-3 py-2.5 text-xs text-status-red-fg hover:opacity-70 disabled:opacity-50"
                  >
                    Bu cihazda kapat
                  </button>
                </div>
              </div>
            ) : permission === "denied" ? (
              <p className="text-sm">
                Bildirim izni bu cihazda reddedilmiş. iPhone&apos;da <strong>Ayarlar → Bildirimler →
                Betty Admin</strong>, bilgisayarda adres çubuğundaki kilit simgesinden izin verip
                sayfayı yenileyin.
              </p>
            ) : (
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-ink-soft">Bu cihazda bildirimler kapalı.</p>
                <button
                  type="button"
                  onClick={enable}
                  disabled={busy}
                  className="bg-ink px-6 py-3 text-xs font-medium tracking-[0.14em] text-ivory uppercase hover:bg-gold-deep disabled:opacity-50"
                >
                  {busy ? "Açılıyor..." : "🔔 Bildirimleri Aç"}
                </button>
              </div>
            )}
          </>
        )}

        {message && (
          <p className={`mt-4 text-xs ${message.tone === "ok" ? "text-status-green-fg" : "text-status-red-fg"}`}>
            {message.text}
          </p>
        )}
      </section>

      {otherDevices.length > 0 && (
        <section className="border border-line bg-white p-5">
          <h2 className="mb-3 text-xs font-medium tracking-wide text-ink-soft uppercase">
            Bildirim alan diğer cihazlarınız
          </h2>
          <ul className="divide-y divide-line">
            {otherDevices.map((device) => (
              <li key={device.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span>
                  {device.device_name ?? "Cihaz"}
                  <span className="block text-xs text-ink-faint">
                    Eklendi: {new Date(device.created_at).toLocaleDateString("tr-TR")}
                    {device.last_used_at &&
                      ` · Son bildirim: ${new Date(device.last_used_at).toLocaleDateString("tr-TR")}`}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => startTransition(async () => void (await deletePushSubscription(device.id)))}
                  className="text-xs text-status-red-fg hover:opacity-70"
                >
                  Kaldır
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function IosInstallGuide() {
  return (
    <div className="text-sm">
      <p className="mb-3">
        iPhone&apos;da bildirim alabilmek için paneli önce <strong>uygulama olarak</strong> ana ekrana
        ekleyin:
      </p>
      <ol className="mb-3 list-decimal space-y-1.5 pl-5">
        <li>
          Bu sayfayı <strong>Safari</strong>&apos;de açın.
        </li>
        <li>
          Alttaki <strong>Paylaş</strong> düğmesine (kare içinde yukarı ok) dokunun.
        </li>
        <li>
          <strong>Ana Ekrana Ekle</strong>&apos;yi seçip <strong>Ekle</strong>&apos;ye dokunun.
        </li>
        <li>
          Ana ekrandaki <strong>Betty Admin</strong> ikonundan uygulamayı açın, giriş yapın ve bu
          sayfaya (Bildirimler) gelip <strong>Bildirimleri Aç</strong>&apos;a dokunun.
        </li>
      </ol>
      <p className="text-xs text-ink-faint">iOS 16.4 veya üstü gerekir.</p>
    </div>
  );
}
