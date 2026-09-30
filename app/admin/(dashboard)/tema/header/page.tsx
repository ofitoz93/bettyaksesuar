import { getSiteSettings } from "@/lib/data/siteSettings";
import HeaderForm from "./HeaderForm";

export default async function TemaHeaderPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Üst Kısım (Header) Düzeni</h1>
      <HeaderForm
        primaryLinks={settings.headerPrimaryLinks}
        secondaryLinks={settings.headerSecondaryLinks}
      />
    </div>
  );
}
