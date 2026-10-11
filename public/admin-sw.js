// Betty Admin uygulaması service worker'ı (kapsam: /admin/).
// Sunucudan gelen push bildirimlerini gösterir; dokununca ilgili admin sayfasını açar.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Betty Admin", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Betty Admin";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/admin-icons/icon-192.png",
      badge: "/admin-icons/badge-96.png",
      tag: data.tag,
      renotify: Boolean(data.tag),
      data: { url: data.url || "/admin" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/admin", self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      // Açık bir admin penceresi varsa onu kullan, yoksa yenisini aç
      for (const client of windows) {
        if (new URL(client.url).pathname.startsWith("/admin")) {
          await client.focus();
          if ("navigate" in client) return client.navigate(target);
          return;
        }
      }
      return self.clients.openWindow(target);
    })(),
  );
});
