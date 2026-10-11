"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendToSubscriptions } from "@/lib/push";

export interface PushPrefs {
  notify_new_order: boolean;
  notify_order_cancelled: boolean;
  notify_return_request: boolean;
  notify_stock_request: boolean;
  notify_low_stock: boolean;
}

const PREF_KEYS: (keyof PushPrefs)[] = [
  "notify_new_order",
  "notify_order_cancelled",
  "notify_return_request",
  "notify_stock_request",
  "notify_low_stock",
];

interface BrowserSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

// Tablo RLS'i yalnızca admin'in kendi satırlarına izin verir; burada ayrıca
// oturum kontrolü yapılır (server action'lar herkese açık uç noktalardır).
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return { supabase, user: profile?.role === "admin" ? user : null };
}

export async function savePushSubscription(
  subscription: BrowserSubscription,
  deviceName: string,
): Promise<{ error?: string }> {
  const { supabase, user } = await requireAdmin();
  if (!user) return { error: "Yetkiniz yok." };
  if (!subscription?.endpoint?.startsWith("https://") || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return { error: "Geçersiz bildirim aboneliği." };
  }

  const { error } = await supabase.from("admin_push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      device_name: deviceName.slice(0, 80) || null,
    },
    { onConflict: "endpoint" },
  );
  if (error) return { error: `Kaydedilemedi: ${error.message}` };

  revalidatePath("/admin/bildirimler");
  return {};
}

export async function updatePushPrefs(endpoint: string, prefs: PushPrefs): Promise<{ error?: string }> {
  const { supabase, user } = await requireAdmin();
  if (!user) return { error: "Yetkiniz yok." };

  const update = Object.fromEntries(PREF_KEYS.map((key) => [key, Boolean(prefs[key])]));
  const { error } = await supabase
    .from("admin_push_subscriptions")
    .update(update)
    .eq("endpoint", endpoint)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/admin/bildirimler");
  return {};
}

export async function deletePushSubscription(id: string): Promise<{ error?: string }> {
  const { supabase, user } = await requireAdmin();
  if (!user) return { error: "Yetkiniz yok." };

  const { error } = await supabase
    .from("admin_push_subscriptions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/admin/bildirimler");
  return {};
}

export async function sendTestPush(endpoint: string): Promise<{ error?: string }> {
  const { supabase, user } = await requireAdmin();
  if (!user) return { error: "Yetkiniz yok." };

  const { data: row } = await supabase
    .from("admin_push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("endpoint", endpoint)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!row) return { error: "Bu cihaz kayıtlı değil, bildirimleri yeniden açın." };

  const { sent } = await sendToSubscriptions([row], {
    title: "🔔 Test bildirimi",
    body: "Bildirimler bu cihazda çalışıyor. Yeni siparişler burada görünecek.",
    url: "/admin/bildirimler",
    tag: "test",
  });
  if (sent === 0) {
    return {
      error:
        "Bildirim gönderilemedi. Sunucuda VAPID anahtarlarının tanımlı olduğundan emin olun ve bildirimleri yeniden açın.",
    };
  }
  return {};
}
