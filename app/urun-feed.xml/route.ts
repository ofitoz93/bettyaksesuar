import { getProducts } from "@/lib/data/products";
import { getStoreSettings } from "@/lib/data/storeSettings";

// Günde 1 defa yeniden oluşturulur — her istekte veritabanına gitmez.
export const revalidate = 86400;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function GET() {
  const [products, settings] = await Promise.all([getProducts(), getStoreSettings()]);

  if (!settings.xmlFeedEnabled) {
    return new Response("Ürün veri akışı şu anda devre dışı.", { status: 404 });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

  const items = products
    .map((product) => {
      const link = `${siteUrl}/urun/${product.slug}`;
      const image = product.images?.[0];
      const description = stripHtml(product.description ?? product.name);

      return `  <item>
    <g:id>${escapeXml(product.id)}</g:id>
    <title>${escapeXml(product.name)}</title>
    <description>${escapeXml(description)}</description>
    <link>${escapeXml(link)}</link>
${image ? `    <g:image_link>${escapeXml(image)}</g:image_link>\n` : ""}    <g:price>${product.price.toFixed(2)} ${settings.currencyCode}</g:price>
    <g:availability>${(product.stock ?? 0) > 0 ? "in_stock" : "out_of_stock"}</g:availability>
    <g:condition>new</g:condition>
    <g:brand>${escapeXml(settings.storeName)}</g:brand>
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${escapeXml(settings.storeName)} Ürün Akışı</title>
  <link>${escapeXml(siteUrl)}</link>
  <description>Universal ürün veri akışı</description>
${items}
</channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
