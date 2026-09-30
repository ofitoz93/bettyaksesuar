import { getSiteSettings } from "@/lib/data/siteSettings";
import FooterForm from "./FooterForm";

export default async function TemaFooterPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Alt Kısım (Footer) Düzeni</h1>
      <FooterForm
        description={settings.footerDescription}
        helpLinks={settings.footerHelpLinks}
        companyLinks={settings.footerCompanyLinks}
      />
    </div>
  );
}
