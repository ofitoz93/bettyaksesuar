import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import HeroCarousel from "./HeroCarousel";
import { getSiteSettings } from "@/lib/data/siteSettings";
import { getHeroImages } from "@/lib/data/heroImages";

export default async function Hero() {
  const [settings, heroImages] = await Promise.all([getSiteSettings(), getHeroImages()]);
  const headingLines = settings.heroHeading.split("\n");

  return (
    <section className="relative h-[680px] w-full overflow-hidden">
      <HeroCarousel images={heroImages.map((image) => image.imageUrl)} />

      {/* Legibility gradient over the photo — kept dark across the whole frame so
          text stays readable no matter what colors the uploaded photo has */}
      <div className="pointer-events-none absolute inset-0 z-10 [background:linear-gradient(180deg,rgba(10,8,6,0.55)_0%,rgba(10,8,6,0.35)_24%,rgba(10,8,6,0.5)_55%,rgba(8,6,4,0.85)_100%)]" />
      {/* Extra scrim directly behind the text block for guaranteed contrast */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[360px] [background:linear-gradient(180deg,rgba(8,6,4,0)_0%,rgba(8,6,4,0.55)_45%,rgba(8,6,4,0.88)_100%)]" />

      <Header variant="transparent" />

      {/* Hero copy, anchored to the bottom of the image */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-8 pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-[18px] text-[11px] font-medium tracking-[0.22em] text-gold uppercase [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
            {settings.heroEyebrow}
          </div>
          <h1 className="font-display max-w-xl text-[56px] leading-[1.08] text-ivory [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]">
            {headingLines.map((line, index) => (
              <span key={index}>
                {line}
                {index < headingLines.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#EDE6D8] [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
            {settings.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href={settings.heroPrimaryHref} variant="white">
              {settings.heroPrimaryLabel}
            </Button>
            <Button href={settings.heroSecondaryHref} variant="ghost-light">
              {settings.heroSecondaryLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
