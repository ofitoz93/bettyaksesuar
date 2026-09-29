import Hero from "@/components/sections/Hero";
import TrustBar from "@/components/sections/TrustBar";
import CategoryGrid from "@/components/sections/CategoryGrid";
import BestSellers from "@/components/sections/BestSellers";
import CampaignBanner from "@/components/sections/CampaignBanner";
import EngravingSection from "@/components/sections/EngravingSection";
import Testimonials from "@/components/sections/Testimonials";
import InstagramStrip from "@/components/sections/InstagramStrip";
import Newsletter from "@/components/sections/Newsletter";
import Footer from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/data/siteSettings";

export default async function Home() {
  const settings = await getSiteSettings();

  return (
    <>
      <div className="bg-ink px-4 py-2.5 text-center text-[11.5px] tracking-wide text-ivory">
        {settings.announcementText}
      </div>
      <Hero />
      <TrustBar />
      <CategoryGrid />
      <BestSellers />
      <CampaignBanner />
      <EngravingSection />
      <Testimonials />
      <InstagramStrip />
      <Newsletter />
      <Footer />
    </>
  );
}
