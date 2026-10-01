import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/jost/300.css";
import "@fontsource/jost/400.css";
import "@fontsource/jost/500.css";
import "@fontsource/jost/600.css";
import "./globals.css";
import { CartProvider } from "@/lib/cart/CartContext";
import { FavoritesProvider } from "@/lib/favorites/FavoritesContext";
import PromoPopup from "@/components/PromoPopup";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import { getPromoPopupSettings } from "@/lib/data/promoPopup";
import { getBestSellers } from "@/lib/data/products";
import { getSiteSettings } from "@/lib/data/siteSettings";
import { getStoreSettings } from "@/lib/data/storeSettings";

export async function generateMetadata(): Promise<Metadata> {
  const storeSettings = await getStoreSettings();

  return {
    title: "Betty Aksesuar | Su Geçirmez Çelik Takı",
    description:
      "Su geçirmez, kararmaz, 18 ayar altın kaplama çelik takılar. Kolye, küpe, bileklik ve yüzük koleksiyonlarını keşfedin.",
    icons: storeSettings.faviconUrl ? { icon: storeSettings.faviconUrl } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [promoSettings, promoProducts, siteSettings] = await Promise.all([
    getPromoPopupSettings(),
    getBestSellers(4),
    getSiteSettings(),
  ]);

  return (
    <html lang="tr">
      <body className="font-sans antialiased">
        <FavoritesProvider>
          <CartProvider>
            <AnnouncementBar texts={siteSettings.announcementTexts} />
            {children}
            <PromoPopup settings={promoSettings} products={promoProducts} />
          </CartProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}
