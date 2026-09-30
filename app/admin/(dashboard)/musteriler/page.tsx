import { getCustomers } from "@/lib/data/customers";

export default async function MusterilerPage() {
  const customers = await getCustomers();

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Müşteriler</h1>

      {customers.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Henüz üye kaydı yok ya da müşteri listesi için gereken sunucu anahtarı
          (SUPABASE_SERVICE_ROLE_KEY) tanımlı değil.
        </p>
      ) : (
        <div className="overflow-x-auto border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-ink-soft uppercase">
                <th className="px-4 py-3 font-medium">Ad Soyad</th>
                <th className="px-4 py-3 font-medium">E-posta</th>
                <th className="px-4 py-3 font-medium">Telefon</th>
                <th className="px-4 py-3 font-medium">Sipariş</th>
                <th className="px-4 py-3 font-medium">Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">{customer.fullName || "—"}</td>
                  <td className="px-4 py-3 text-ink-soft">{customer.email}</td>
                  <td className="px-4 py-3 text-ink-soft">{customer.phone || "—"}</td>
                  <td className="px-4 py-3">{customer.orderCount}</td>
                  <td className="px-4 py-3 text-ink-faint">
                    {new Date(customer.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
