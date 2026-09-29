"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

export interface StockNotifyState {
  error?: string;
  info?: string;
}

export async function requestStockNotification(
  _prevState: StockNotifyState,
  formData: FormData,
): Promise<StockNotifyState> {
  const productId = String(formData.get("productId") ?? "").trim();
  const productName = String(formData.get("productName") ?? "").trim();
  const productSlug = String(formData.get("productSlug") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!productId || !email || !email.includes("@")) {
    return { error: "Lütfen geçerli bir e-posta adresi girin." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("stock_notifications").upsert(
    {
      product_id: productId,
      email,
      customer_id: user?.id ?? null,
      notified_at: null,
    },
    { onConflict: "product_id,email" },
  );

  if (error) {
    console.error("requestStockNotification error:", error.message);
    return { error: "Talebiniz kaydedilemedi, lütfen tekrar deneyin." };
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    await sendEmail({
      to: adminEmail,
      subject: `Stok talebi: ${productName}`,
      html: `<p><strong>${productName}</strong> ürünü için stok talebi geldi.</p><p>Talep eden: ${email}</p><p><a href="${siteUrl}/urun/${productSlug}">Ürünü görüntüle</a> · <a href="${siteUrl}/admin/stok-talepleri">Admin panelinde tüm talepler</a></p>`,
    });
  }

  revalidatePath("/admin/stok-talepleri");
  return { info: "Teşekkürler! Ürün stoğa girince size e-posta ile haber vereceğiz." };
}
