import { getStoreSettings } from "@/lib/data/storeSettings";

export const metadata = {
  title: "Bakımdayız",
};

export default async function BakimPage() {
  const settings = await getStoreSettings();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-8 text-center">
      <div className="font-display mb-4 text-[28px]">{settings.storeName}</div>
      <h1 className="mb-3 text-xl">Sitemiz kısa bir bakımda</h1>
      <p className="max-w-md text-sm text-ink-soft">
        En kısa sürede tekrar hizmetinizdeyiz. Anlayışınız için teşekkür ederiz.
      </p>
    </div>
  );
}
