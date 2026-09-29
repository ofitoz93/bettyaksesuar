import Link from "next/link";
import { getPendingStockNotificationsForAdmin } from "@/lib/data/stockNotifications";
import CloseStockNotificationButton from "./CloseStockNotificationButton";

export default async function AdminStokTalepleriPage() {
  const groups = await getPendingStockNotificationsForAdmin();

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Stok Talepleri</h1>

      {groups.length === 0 ? (
        <p className="text-sm text-ink-soft">Henüz stok talebi yok.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.productId} className="border border-line bg-white p-5">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{group.productName}</div>
                  <div className="text-xs text-ink-faint">
                    {group.requests.length} kişi haber bekliyor
                  </div>
                </div>
                {group.productSlug && (
                  <Link
                    href={`/admin/urun/${group.productId}`}
                    className="text-xs tracking-wide text-gold-deep hover:underline"
                  >
                    Ürünü Düzenle (stok gir → otomatik mail gider) →
                  </Link>
                )}
              </div>

              <ul className="flex flex-col gap-1 border-t border-line pt-3 text-sm text-ink-soft">
                {group.requests.map((request) => (
                  <li key={request.id} className="flex items-center justify-between gap-3">
                    <span>{request.email}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-ink-faint">
                        {new Date(request.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                      <CloseStockNotificationButton id={request.id} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
