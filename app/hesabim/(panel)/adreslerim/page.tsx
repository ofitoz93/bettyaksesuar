import { getMyAddresses } from "@/lib/data/addresses";
import { getCurrentProfile } from "@/lib/data/profile";
import AddressBook from "./AddressBook";

export const metadata = { title: "Adreslerim | Betty Aksesuar" };

export default async function AdreslerimPage() {
  const [addresses, profile] = await Promise.all([getMyAddresses(), getCurrentProfile()]);

  return (
    <div>
      <div className="mb-6 border-b border-line pb-4">
        <h1 className="font-display text-[28px]">Adreslerim</h1>
        <p className="mt-1 text-xs text-ink-soft">
          Kayıtlı adreslerinizi ödeme sırasında tek tıkla seçebilirsiniz. Varsayılan adresiniz
          ödeme sayfasında otomatik doldurulur.
        </p>
      </div>

      <AddressBook
        addresses={addresses}
        defaultFullName={profile?.fullName ?? ""}
        defaultPhone={profile?.phone ?? ""}
      />
    </div>
  );
}
