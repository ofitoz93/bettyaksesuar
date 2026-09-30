import { getNotificationSettings } from "@/lib/data/notificationSettings";
import UyarilarForm from "./UyarilarForm";

export default async function UyarilarPage() {
  const settings = await getNotificationSettings();

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Uyarı Mesajları</h1>
      <UyarilarForm settings={settings} />
    </div>
  );
}
