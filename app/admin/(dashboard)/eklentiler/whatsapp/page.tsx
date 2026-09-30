import { getStoreSettings } from "@/lib/data/storeSettings";
import WhatsAppForm from "./WhatsAppForm";

export default async function WhatsAppEklentiPage() {
  const settings = await getStoreSettings();

  return (
    <div>
      <h1 className="font-display mb-2 text-[28px]">Eklentiler — WhatsApp Sipariş</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Etkinleştirdiğinizde ana sayfada ve ürün sayfalarında sağ altta bir WhatsApp
        butonu belirir; ürün sayfasından tıklandığında mesaja o ürünün adı ve bağlantısı
        otomatik eklenir.
      </p>
      <WhatsAppForm settings={settings} />
    </div>
  );
}
