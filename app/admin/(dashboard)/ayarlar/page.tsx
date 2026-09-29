import { getShippingSettings } from "@/lib/data/shipping";
import ShippingSettingsForm from "./ShippingSettingsForm";

export default async function AyarlarPage() {
  const settings = await getShippingSettings();

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Ayarlar</h1>

      <div className="max-w-md border border-line bg-white p-6">
        <h2 className="mb-1 text-sm font-medium">Kargo Ücreti</h2>
        <p className="mb-5 text-xs text-ink-soft">
          Belirlediğiniz tutarın altındaki siparişlerden kargo ücreti alınır, üstündekiler
          ücretsiz kargoyla gönderilir.
        </p>
        <ShippingSettingsForm settings={settings} />
      </div>
    </div>
  );
}
