import { getStoreSettings } from "@/lib/data/storeSettings";
import UrunlerAyarForm from "./UrunlerAyarForm";

export default async function UrunlerAyarlarPage() {
  const settings = await getStoreSettings();

  return (
    <div>
      <h1 className="font-display mb-2 text-[28px]">Ürün Listeleme Ayarları</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Not: Yorum izinleri şu an için ayar olarak saklanır; müşterilerin ürün sayfasından
        yorum bırakabileceği form ayrı bir aşamada (Katalog) eklenecek.
      </p>
      <UrunlerAyarForm settings={settings} />
    </div>
  );
}
