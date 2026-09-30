import { getStoreSettings } from "@/lib/data/storeSettings";
import GenelForm from "./GenelForm";

export default async function GenelAyarlarPage() {
  const settings = await getStoreSettings();

  return (
    <div>
      <h1 className="font-display mb-2 text-[28px]">Genel Ayarlar</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Arama motorlarında sitenizin nasıl göründüğünü belirleyen genel meta bilgileri.
      </p>
      <GenelForm settings={settings} />
    </div>
  );
}
