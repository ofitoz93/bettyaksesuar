import Link from "next/link";
import { Suspense } from "react";
import { getCustomers } from "@/lib/data/customers";
import { formatPrice } from "@/lib/orders";
import ListToolbar from "@/components/admin/ListToolbar";

export default async function MusterilerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const customers = await getCustomers(q);

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between gap-3">
        <h1 className="font-display text-[28px]">Müşteriler</h1>
        <span className="text-xs text-ink-soft">{customers.length} müşteri</span>
      </div>

      <Suspense>
        <ListToolbar placeholder="Ad, e-posta veya telefon ara..." />
      </Suspense>

      {customers.length === 0 ? (
        <div className="border border-dashed border-line bg-white px-6 py-12 text-center text-sm text-ink-soft">
          {q
            ? "Aramanıza uyan müşteri bulunamadı."
            : "Henüz üye kaydı yok ya da müşteri listesi için gereken sunucu anahtarı (SUPABASE_SERVICE_ROLE_KEY) tanımlı değil."}
        </div>
      ) : (
        <div className="overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] tracking-wide text-ink-soft uppercase">
                <th className="px-4 py-3 font-medium">Müşteri</th>
                <th className="px-4 py-3 font-medium">Telefon</th>
                <th className="px-4 py-3 font-medium">Sipariş</th>
                <th className="px-4 py-3 font-medium">Harcama</th>
                <th className="px-4 py-3 font-medium">Kayıt</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const href = `/admin/musteriler/${customer.id}`;
                return (
                  <tr key={customer.id} className="group border-b border-line last:border-0 hover:bg-ivory">
                    <td className="px-4 py-3">
                      <Link href={href} className="block group-hover:text-gold-deep">
                        {customer.fullName || "—"}
                        <div className="text-xs text-ink-faint">{customer.email}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{customer.phone || "—"}</td>
                    <td className="px-4 py-3">{customer.orderCount}</td>
                    <td className="px-4 py-3">{formatPrice(customer.totalSpent)}</td>
                    <td className="px-4 py-3 text-ink-faint">
                      {new Date(customer.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
