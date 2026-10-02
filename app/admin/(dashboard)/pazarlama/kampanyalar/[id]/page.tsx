import { notFound } from "next/navigation";
import { getCampaignById } from "@/lib/data/campaigns";
import { updateCampaign } from "@/app/admin/actions";
import CampaignForm from "../CampaignForm";

interface EditCampaignPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
  const { id } = await params;
  const campaign = await getCampaignById(id);

  if (!campaign) {
    notFound();
  }

  const updateWithId = updateCampaign.bind(null, id);

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Kampanyayı Düzenle</h1>
      <CampaignForm action={updateWithId} campaign={campaign} submitLabel="Değişiklikleri Kaydet" />
    </div>
  );
}
