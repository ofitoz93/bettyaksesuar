import { createCampaign } from "@/app/admin/actions";
import CampaignForm from "../CampaignForm";

export default function YeniKampanyaPage() {
  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Yeni Kampanya</h1>
      <CampaignForm action={createCampaign} submitLabel="Oluştur" />
    </div>
  );
}
