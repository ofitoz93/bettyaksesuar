"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { notifyAdmins } from "@/lib/push";
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
  // Tabloya doğrudan yazma kapalı; fonksiyon müşteri kimliğini oturumdan alır
  const { error } = await supabase.rpc("request_stock_notification", {
    p_product_id: productId,
    p_email: email,
  });

  if (error) {
    console.error("requestStockNotification error:", error.message);
    return { error: "Talebiniz kaydedilemedi, lütfen tekrar deneyin." };
  }

  // Ürün adı formdan değil veritabanından alınır
  const { data: product } = await supabase.from("products").select("name").eq("id", productId).maybeSingle();
  after(() =>
    notifyAdmins("stock_request", {
      title: `🔔 Stok talebi · ${product?.name ?? productName}`,
      body: `${email} ürün stoğa girince haber almak istiyor.`,
      url: "/admin/stok-talepleri",
      tag: `stock-request-${productId}`,
    }),
  );

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
