import Image from "next/image";
import { getSocialFeedImages } from "@/lib/data/socialFeed";
import { getSiteSettings } from "@/lib/data/siteSettings";

const placeholderTiles = [
  "from-[#EDE3D2] to-[#D9C7A6]",
  "from-[#E2D6C0] to-[#C7A876]",
  "from-[#EDE3D2] to-[#D9C7A6]",
  "from-[#D8C09A] to-[#EDE3D2]",
  "from-[#E2D6C0] to-[#C7A876]",
  "from-[#EDE3D2] to-[#D9C7A6]",
];

export default async function InstagramStrip() {
  const [images, settings] = await Promise.all([getSocialFeedImages(), getSiteSettings()]);

  if (!settings.socialFeedEnabled) {
    return null;
  }

  return (
    <section className="px-8 py-22">
      <div className="mx-auto max-w-6xl">
        <div className="mb-9 text-center">
          <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
            SOSYAL MEDYA
          </div>
          <h2 className="font-display mt-2.5 text-[30px]">
            @{settings.siteName.toLowerCase().replace(/\s+/g, "")}
            {settings.siteTagline.toLowerCase().replace(/\s+/g, "")}
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          {images.length > 0
            ? images.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square w-[calc(50%-5px)] sm:w-[calc(33.333%-7px)] md:w-[calc(16.666%-8px)]"
                >
                  <Image
                    src={image.imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 16vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))
            : placeholderTiles.map((gradient, i) => (
                <div
                  key={i}
                  className={`aspect-square w-[calc(50%-5px)] bg-linear-to-br sm:w-[calc(33.333%-7px)] md:w-[calc(16.666%-8px)] ${gradient}`}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
