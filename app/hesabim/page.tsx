import Link from "next/link";
import { getCurrentProfile } from "@/lib/data/profile";
import { customerLogout } from "@/app/hesabim/actions";

export default async function HesabimPage() {
  const profile = await getCurrentProfile();

  return (
    <div>
      <div className="mb-10 text-center">
        <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
          HESABIM
        </div>
        <h1 className="font-display mt-2.5 text-[28px]">
          Merhaba, {profile?.fullName || profile?.email}
        </h1>
      </div>

      <div className="flex flex-col gap-3">
        <div className="border border-line p-6">
          <div className="mb-1 text-xs tracking-wide text-ink-soft uppercase">E-posta</div>
          <div className="text-sm">{profile?.email}</div>
          {profile?.phone && (
            <>
              <div className="mt-4 mb-1 text-xs tracking-wide text-ink-soft uppercase">Telefon</div>
              <div className="text-sm">{profile.phone}</div>
            </>
          )}
        </div>

        <Link
          href="/hesabim/siparislerim"
          className="flex items-center justify-between border border-line px-6 py-4 text-sm hover:border-ink"
        >
          Siparişlerim
          <span>→</span>
        </Link>

        {profile?.isAdmin && (
          <Link
            href="/admin"
            className="flex items-center justify-between border border-gold-deep px-6 py-4 text-sm text-gold-deep hover:bg-gold-deep hover:text-ivory"
          >
            Yönetim Paneli
            <span>→</span>
          </Link>
        )}

        <form action={customerLogout}>
          <button
            type="submit"
            className="w-full border border-line px-6 py-4 text-left text-sm text-status-red-fg hover:border-status-red-fg"
          >
            Çıkış Yap
          </button>
        </form>
      </div>
    </div>
  );
}
