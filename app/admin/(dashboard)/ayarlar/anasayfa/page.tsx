import { getSiteSettings } from "@/lib/data/siteSettings";
import { getHeroImages } from "@/lib/data/heroImages";
import SiteSettingsForm from "./SiteSettingsForm";
import HeroImagesManager from "./HeroImagesManager";

export default async function AnaSayfaAyarlarPage() {
  const [settings, heroImages] = await Promise.all([getSiteSettings(), getHeroImages()]);

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Ana Sayfa İçeriği</h1>

      <div className="mb-6 max-w-2xl border border-line bg-white p-6">
        <HeroImagesManager images={heroImages} />
      </div>

      <div className="max-w-2xl border border-line bg-white p-6">
        <SiteSettingsForm settings={settings} />
      </div>
    </div>
  );
}
