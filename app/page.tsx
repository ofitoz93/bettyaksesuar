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
import WhatsAppButton from "@/components/ui/WhatsAppButton";

export default function Home() {
  return (
    <>
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
      <WhatsAppButton />
    </>
  );
}
