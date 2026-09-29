import { getPromoPopupSettings } from "@/lib/data/promoPopup";
import PromoPopupForm from "./PromoPopupForm";

export default async function KampanyaAyarlarPage() {
  const settings = await getPromoPopupSettings();

  return (
    <div>
      <h1 className="font-display mb-2 text-[28px]">Kampanya Popup&apos;ı</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Ziyaretçi sitede belirlediğiniz süre kadar kaldığında bir kez, kart şeklinde bir
        kampanya penceresi gösterilir.
      </p>
      <div className="max-w-2xl border border-line bg-white p-6">
        <PromoPopupForm settings={settings} />
      </div>
    </div>
  );
}
