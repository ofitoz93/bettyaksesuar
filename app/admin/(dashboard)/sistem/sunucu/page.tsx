import { getStoreSettings } from "@/lib/data/storeSettings";
import SunucuForm from "./SunucuForm";

export default async function SunucuAyarlariPage() {
  const settings = await getStoreSettings();

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Sunucu</h1>
      <SunucuForm settings={settings} />
    </div>
  );
}
