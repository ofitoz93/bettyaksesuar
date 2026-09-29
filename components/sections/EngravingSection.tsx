import Image from "next/image";
import Button from "@/components/ui/Button";
import { getSiteSettings } from "@/lib/data/siteSettings";

export default async function EngravingSection() {
  const settings = await getSiteSettings();

  return (
    <section className="px-8 py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-16 md:flex-row">
        <div className="w-full flex-1">
          <div className="relative flex aspect-5/4 items-center justify-center overflow-hidden bg-linear-to-br from-[#E7D9C2] to-[#C7A876]">
            {settings.engravingImageUrl ? (
              <Image
                src={settings.engravingImageUrl}
                alt=""
                fill
                quality={90}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <>
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#FAF6F0" strokeWidth={0.8}>
                  <rect x="4" y="7" width="16" height="11" rx="1" />
                  <path d="M8 7V5a4 4 0 0 1 8 0v2" />
                </svg>
                <div className="absolute bottom-5 left-5 text-[10.5px] tracking-[0.14em] text-[#FAF6F0] uppercase opacity-85">
                  [ Atölye Görseli ]
                </div>
              </>
            )}
          </div>
        </div>
        <div className="w-full flex-1">
          <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
            {settings.engravingEyebrow}
          </div>
          <h2 className="font-display mt-3 text-[34px]">{settings.engravingHeading}</h2>
          <p className="mt-[18px] max-w-md text-[15px] leading-relaxed text-ink-soft">
            {settings.engravingBody}
          </p>
          <Button href="/gravur" variant="dark" className="mt-7">
            {settings.engravingButtonLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
