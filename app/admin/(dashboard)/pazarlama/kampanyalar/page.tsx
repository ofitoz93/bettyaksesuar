import Link from "next/link";
import { getAllCampaigns } from "@/lib/data/campaigns";
import ToggleCampaignButton from "./ToggleCampaignButton";

export default async function KampanyalarPage() {
  const campaigns = await getAllCampaigns();

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[28px]">Kampanyalar</h1>
        <Link
          href="/admin/pazarlama/kampanyalar/yeni"
          className="bg-ink px-6 py-3 text-xs font-medium tracking-[0.14em] text-ivory uppercase hover:bg-gold-deep"
        >
          + Yeni Kampanya
        </Link>
      </div>
      <p className="mb-8 text-sm text-ink-soft">
        Aktif kampanyalar tüm kullanıcılar için geçerlidir. Her müşteri bir kampanya kodunu en
        fazla 1 kez kullanabilir.
      </p>

      {campaigns.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Henüz kampanya yok. &ldquo;Yeni Kampanya&rdquo; ile ilk kampanyanızı oluşturun.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-line border-y border-line bg-white">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="flex items-center gap-5 px-5 py-4">
              <div className="flex-1">
                <div className="text-sm">{campaign.title}</div>
                <div className="mt-0.5 text-xs text-ink-faint">
                  Kod: {campaign.code} · %{campaign.discountPercent} indirim
                </div>
              </div>
              <ToggleCampaignButton id={campaign.id} enabled={campaign.enabled} />
              <Link
                href={`/admin/pazarlama/kampanyalar/${campaign.id}`}
                className="text-xs tracking-wide text-ink-soft hover:text-ink"
              >
                Düzenle
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
