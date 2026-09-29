import { getAllReturnRequestsForAdmin } from "@/lib/data/returns";
import ReturnStatusForm from "./ReturnStatusForm";

export default async function AdminIadelerPage() {
  const requests = await getAllReturnRequestsForAdmin();

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">İade Talepleri</h1>

      {requests.length === 0 ? (
        <p className="text-sm text-ink-soft">Henüz iade talebi yok.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((request) => (
            <div key={request.id} className="border border-line bg-white p-5">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm">{request.orderNumber}</div>
                  <div className="text-xs text-ink-faint">
                    {new Date(request.createdAt).toLocaleString("tr-TR")}
                  </div>
                  <div className="mt-1 text-xs text-ink-soft">
                    {request.guestName} — {request.guestEmail}
                  </div>
                </div>
                <ReturnStatusForm
                  requestId={request.id}
                  status={request.status}
                  adminNote={request.adminNote}
                />
              </div>

              <div className="border-t border-line pt-3 text-sm text-ink-soft">
                {request.reason}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
