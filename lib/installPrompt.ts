"use client";

import { useSyncExternalStore } from "react";

// Android Chrome / masaüstü Chrome-Edge, uygulama kurulabilir olduğunda
// "beforeinstallprompt" olayını gönderir. Olay sayfa açılır açılmaz gelebildiği
// için modül yüklenirken dinlenir ve saklanır; "Uygulamayı Yükle" butonları
// buradan tetikler. (iPhone'da bu olay yok; orada Paylaş > Ana Ekrana Ekle.)

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type InstallState = "unavailable" | "available" | "installed";

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let state: InstallState = "unavailable";
const listeners = new Set<() => void>();

function setState(next: InstallState) {
  state = next;
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  if (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  ) {
    state = "installed";
  }
  window.addEventListener("beforeinstallprompt", (event) => {
    // Tarayıcının kendi küçük önerisini gösterme; kendi butonumuzla soracağız
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    setState("available");
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    setState("installed");
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useInstallState(): InstallState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => "unavailable",
  );
}

// Kurulum penceresini açar; kullanıcı onaylarsa true döner
export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  const event = deferredPrompt;
  // Olay yalnızca bir kez kullanılabilir
  deferredPrompt = null;
  await event.prompt();
  const { outcome } = await event.userChoice;
  if (outcome === "accepted") setState("installed");
  else setState("unavailable");
  return outcome === "accepted";
}
