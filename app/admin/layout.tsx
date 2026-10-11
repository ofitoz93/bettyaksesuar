import type { Metadata, Viewport } from "next";

// Admin paneli telefonda "Ana Ekrana Ekle" ile ayrı bir uygulama (Betty Admin)
// olarak kurulabilir; manifest ve iOS meta etiketleri yalnızca /admin altında.
export const metadata: Metadata = {
  manifest: "/admin.webmanifest",
  applicationName: "Betty Admin",
  appleWebApp: {
    capable: true,
    title: "Betty Admin",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/admin-icons/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/admin-icons/icon-512.png?v=2", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/admin-icons/apple-touch-icon.png?v=2", sizes: "180x180" }],
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
