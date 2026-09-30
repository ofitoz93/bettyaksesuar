import { getCurrentProfile } from "@/lib/data/profile";
import ProfilForm from "./ProfilForm";

export default async function ProfilAyarlariPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Profil Ayarları</h1>
      <ProfilForm profile={profile} />
    </div>
  );
}
