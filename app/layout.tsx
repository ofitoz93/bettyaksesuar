import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/jost/300.css";
import "@fontsource/jost/400.css";
import "@fontsource/jost/500.css";
import "@fontsource/jost/600.css";
import "./globals.css";
import { CartProvider } from "@/lib/cart/CartContext";
import PromoPopup from "@/components/PromoPopup";
import { getPromoPopupSettings } from "@/lib/data/promoPopup";
import { getBestSellers } from "@/lib/data/products";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Betty Aksesuar | Su Geçirmez Çelik Takı",
  description:
    "Su geçirmez, kararmaz, 18 ayar altın kaplama çelik takılar. Kolye, küpe, bileklik ve yüzük koleksiyonlarını keşfedin.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const [promoSettings, { data: { user } }, promoProducts] = await Promise.all([
    getPromoPopupSettings(),
    supabase.auth.getUser(),
    getBestSellers(3),
  ]);

  return (
    <html lang="tr">
      <body className="font-sans antialiased">
        <CartProvider>
          {children}
          <PromoPopup settings={promoSettings} loggedIn={!!user} products={promoProducts} />
        </CartProvider>
      </body>
    </html>
  );
}
