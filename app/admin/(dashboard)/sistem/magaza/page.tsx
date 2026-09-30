import { getStoreSettings } from "@/lib/data/storeSettings";
import { getSiteSettings } from "@/lib/data/siteSettings";
import MagazaForm from "./MagazaForm";

export default async function MagazaAyarlariPage() {
  const [settings, siteSettings] = await Promise.all([getStoreSettings(), getSiteSettings()]);

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Mağaza Ayarları</h1>
      <MagazaForm settings={settings} logoUrl={siteSettings.logoUrl} />
    </div>
  );
}
