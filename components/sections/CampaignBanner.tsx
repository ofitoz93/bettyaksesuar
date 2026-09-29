import Image from "next/image";
import Button from "@/components/ui/Button";
import { getSiteSettings } from "@/lib/data/siteSettings";

export default async function CampaignBanner() {
  const settings = await getSiteSettings();
  const headingLines = settings.campaignHeading.split("\n");

  return (
    <section className="px-8">
      <div className="relative mx-auto flex min-h-[420px] max-w-6xl items-center overflow-hidden bg-linear-to-br from-[#2A251E] to-[#42392C]">
        {settings.campaignImageUrl ? (
          <>
            <Image
              src={settings.campaignImageUrl}
              alt=""
              fill
              quality={90}
              sizes="(min-width: 1200px) 1152px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-ink/45" />
          </>
        ) : (
          <div className="pointer-events-none absolute top-1/2 -right-10 -translate-y-1/2 opacity-15">
            <svg width="420" height="420" viewBox="0 0 24 24" fill="none" stroke="#FAF6F0" strokeWidth={0.5}>
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="5.4" />
            </svg>
          </div>
        )}
        <div className="relative z-10 max-w-md p-16">
          <div className="text-[11px] font-medium tracking-[0.22em] text-gold uppercase">
            {settings.campaignEyebrow}
          </div>
          <h2 className="font-display mt-3.5 text-[36px] leading-tight text-ivory">
            {headingLines.map((line, index) => (
              <span key={index}>
                {line}
                {index < headingLines.length - 1 && <br />}
              </span>
            ))}
          </h2>
          <p className="mt-[18px] text-[15px] leading-relaxed text-[#D8CFC0]">
            {settings.campaignBody}
          </p>
          <Button href="/kisiye-ozel" variant="white" className="mt-7">
            {settings.campaignButtonLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
