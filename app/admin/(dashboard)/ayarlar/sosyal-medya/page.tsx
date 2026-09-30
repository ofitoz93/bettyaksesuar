import { getSocialFeedImages } from "@/lib/data/socialFeed";
import { getSiteSettings } from "@/lib/data/siteSettings";
import { updateSocialFeedEnabled } from "@/app/admin/actions";
import SectionVisibilityToggle from "@/components/admin/SectionVisibilityToggle";
import SocialFeedManager from "./SocialFeedManager";

export default async function SosyalMedyaAyarlarPage() {
  const [images, settings] = await Promise.all([getSocialFeedImages(), getSiteSettings()]);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[28px]">Sosyal Medya Görselleri</h1>
        <SectionVisibilityToggle
          initialEnabled={settings.socialFeedEnabled}
          onToggle={updateSocialFeedEnabled}
          label="“Sosyal Medya” bölümünü sitede göster"
        />
      </div>
      <p className="mb-8 text-sm text-ink-soft">
        Ana sayfadaki &ldquo;Sosyal Medya&rdquo; bölümünde gösterilen fotoğraflar. Hiç
        görsel yüklemezseniz yerine varsayılan bir desen gösterilir.
      </p>
      <SocialFeedManager images={images} />
    </div>
  );
}
