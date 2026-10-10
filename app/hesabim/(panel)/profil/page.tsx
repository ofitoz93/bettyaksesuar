import { getCurrentProfile } from "@/lib/data/profile";
import ProfileForms from "./ProfileForms";

export const metadata = { title: "Profilim | Betty Aksesuar" };

export default async function ProfilPage() {
  const profile = await getCurrentProfile();

  return (
    <div>
      <div className="mb-6 border-b border-line pb-4">
        <h1 className="font-display text-[28px]">Profilim</h1>
        <p className="mt-1 text-xs text-ink-soft">
          Kişisel bilgilerinizi, e-posta adresinizi ve şifrenizi buradan yönetebilirsiniz.
        </p>
      </div>

      <ProfileForms
        fullName={profile?.fullName ?? ""}
        phone={profile?.phone ?? ""}
        email={profile?.email ?? ""}
      />
    </div>
  );
}
