import { getNotificationSettings } from "@/lib/data/notificationSettings";
import EpostaForm from "./EpostaForm";

export default async function EpostaAyarlariPage() {
  const settings = await getNotificationSettings();

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">E-posta Ayarları</h1>
      <EpostaForm settings={settings} />
    </div>
  );
}
