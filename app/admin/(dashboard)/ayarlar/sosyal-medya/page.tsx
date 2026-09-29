import { getSocialFeedImages } from "@/lib/data/socialFeed";
import SocialFeedManager from "./SocialFeedManager";

export default async function SosyalMedyaAyarlarPage() {
  const images = await getSocialFeedImages();

  return (
    <div>
      <h1 className="font-display mb-2 text-[28px]">Sosyal Medya Görselleri</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Ana sayfadaki &ldquo;Sosyal Medya&rdquo; bölümünde gösterilen fotoğraflar. Hiç
        görsel yüklemezseniz yerine varsayılan bir desen gösterilir.
      </p>
      <SocialFeedManager images={images} />
    </div>
  );
}
