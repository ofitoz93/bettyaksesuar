import { getStoreSettings } from "@/lib/data/storeSettings";
import YerelForm from "./YerelForm";

export default async function YerelAyarlarPage() {
  const settings = await getStoreSettings();

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Yerel Ayarlar</h1>
      <YerelForm settings={settings} />
    </div>
  );
}
