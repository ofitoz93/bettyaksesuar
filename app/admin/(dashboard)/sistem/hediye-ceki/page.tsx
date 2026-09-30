import { getStoreSettings } from "@/lib/data/storeSettings";
import { updateGiftCardsEnabled } from "@/app/admin/actions";
import SectionVisibilityToggle from "@/components/admin/SectionVisibilityToggle";

export default async function HediyeCekiPage() {
  const settings = await getStoreSettings();

  return (
    <div>
      <h1 className="font-display mb-2 text-[28px]">Hediye Çeki</h1>
      <p className="mb-6 text-sm text-ink-soft">
        Hediye çeki kodu oluşturma ve checkout&apos;ta kullanma ekranları henüz eklenmedi;
        bu anahtar yalnızca özelliğin ileride hangi durumda başlayacağını belirler.
      </p>
      <SectionVisibilityToggle
        initialEnabled={settings.giftCardsEnabled}
        onToggle={updateGiftCardsEnabled}
        label="Hediye çeki özelliğini etkinleştir"
      />
    </div>
  );
}
