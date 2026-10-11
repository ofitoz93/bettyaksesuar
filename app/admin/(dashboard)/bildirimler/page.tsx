import { createClient } from "@/lib/supabase/server";
import PushSettings, { type DeviceRow } from "./PushSettings";

export default async function BildirimlerPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_push_subscriptions")
    .select(
      "id, endpoint, device_name, created_at, last_used_at, notify_new_order, notify_order_cancelled, notify_return_request, notify_stock_request, notify_low_stock",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display mb-2 text-[28px]">Bildirimler</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Yeni sipariş geldiğinde telefonunuza anında bildirim gelsin. Bildirimler cihaz başına
        açılır; telefonda ve bilgisayarda ayrı ayrı açabilirsiniz.
      </p>
      <PushSettings
        devices={(data ?? []) as DeviceRow[]}
        vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""}
      />
    </div>
  );
}
