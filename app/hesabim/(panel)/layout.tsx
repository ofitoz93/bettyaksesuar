import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/profile";
import AccountNav from "@/components/account/AccountNav";

export default async function HesabimPanelLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/hesabim/giris");
  }

  const firstName = (profile.fullName || profile.email).split(" ")[0];

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr] md:gap-12">
      <AccountNav firstName={firstName} isAdmin={profile.isAdmin} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
