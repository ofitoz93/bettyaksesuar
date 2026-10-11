"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyAdmins } from "@/lib/push";
import { formatPrice } from "@/lib/orders";

export interface AuthState {
  error?: string;
  info?: string;
}

export async function customerLogin(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "E-posta veya şifre hatalı." };
  }

  redirect("/hesabim");
}

export async function customerRegister(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!fullName || !email || !password) {
    return { error: "Lütfen ad, e-posta ve şifre alanlarını doldurun." };
  }

  if (password.length < 6) {
    return { error: "Şifre en az 6 karakter olmalı." };
  }

  if (password !== passwordConfirm) {
    return { error: "Şifreler eşleşmiyor." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Bu e-posta ile zaten bir hesap var." };
    }
    return { error: "Kayıt oluşturulamadı, lütfen tekrar deneyin." };
  }

  if (phone && data.user) {
    await supabase.from("profiles").update({ phone }).eq("id", data.user.id);
  }

  if (!data.session) {
    return {
      info: "Hesabınız oluşturuldu. Devam etmek için e-postanıza gelen bağlantıyla doğrulayın.",
    };
  }

  redirect("/hesabim");
}

export async function customerLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/hesabim/giris");
}

export async function cancelMyOrder(orderId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_my_order", { p_order_id: orderId });

  if (error) {
    return { error: error.message };
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, guest_name, total")
    .eq("id", orderId)
    .maybeSingle();
  if (order) {
    after(() =>
      notifyAdmins("order_cancelled", {
        title: `❌ Sipariş iptal edildi · ${order.order_number}`,
        body: `${order.guest_name} · ${formatPrice(Number(order.total))} · müşteri iptal etti`,
        url: `/admin/siparisler/${order.id}`,
        tag: `order-${order.id}`,
      }),
    );
  }

  revalidatePath("/hesabim", "layout");
  return {};
}

export interface AccountFormState {
  error?: string;
  success?: string;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function updateMyProfile(
  _prevState: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!fullName) {
    return { error: "Ad soyad boş bırakılamaz." };
  }

  const { supabase, user } = await requireUser();
  if (!user) return { error: "Oturumunuz sona ermiş, lütfen tekrar giriş yapın." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null })
    .eq("id", user.id);

  if (error) {
    return { error: "Bilgileriniz kaydedilemedi, lütfen tekrar deneyin." };
  }

  revalidatePath("/hesabim", "layout");
  return { success: "Bilgileriniz güncellendi." };
}

export async function changeMyEmail(
  _prevState: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return { error: "Lütfen geçerli bir e-posta adresi girin." };
  }

  const { supabase, user } = await requireUser();
  if (!user) return { error: "Oturumunuz sona ermiş, lütfen tekrar giriş yapın." };

  if (email === user.email?.toLowerCase()) {
    return { error: "Bu zaten mevcut e-posta adresiniz." };
  }

  const { error } = await supabase.auth.updateUser({ email });

  if (error) {
    return { error: "E-posta değiştirilemedi. Bu adres başka bir hesapta kullanılıyor olabilir." };
  }

  return {
    success:
      "Onay bağlantısı gönderildi. Değişikliğin tamamlanması için yeni e-posta adresinize gelen bağlantıya tıklayın.",
  };
}

export async function changeMyPassword(
  _prevState: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 6) {
    return { error: "Yeni şifre en az 6 karakter olmalı." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Yeni şifreler eşleşmiyor." };
  }

  const { supabase, user } = await requireUser();
  if (!user?.email) return { error: "Oturumunuz sona ermiş, lütfen tekrar giriş yapın." };

  // Mevcut şifreyi doğrula — açık kalmış bir oturumdan şifre değiştirilmesini önler
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    return { error: "Mevcut şifreniz hatalı." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: "Şifre değiştirilemedi, lütfen tekrar deneyin." };
  }

  return { success: "Şifreniz değiştirildi." };
}

export async function saveMyAddress(
  addressId: string | null,
  _prevState: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const title = String(formData.get("title") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();
  const neighbourhood = String(formData.get("neighbourhood") ?? "").trim();
  const addressLine = String(formData.get("addressLine") ?? "").trim();
  const makeDefault = formData.get("isDefault") === "on";

  if (!title || !fullName || !phone || !city || !district || !neighbourhood || !addressLine) {
    return { error: "Lütfen tüm alanları doldurun." };
  }

  const { supabase, user } = await requireUser();
  if (!user) return { error: "Oturumunuz sona ermiş, lütfen tekrar giriş yapın." };

  const values = {
    title,
    full_name: fullName,
    phone,
    city,
    district,
    neighbourhood,
    address_line: addressLine,
    updated_at: new Date().toISOString(),
  };

  let savedId = addressId;

  if (addressId) {
    const { error } = await supabase
      .from("customer_addresses")
      .update(values)
      .eq("id", addressId)
      .eq("customer_id", user.id);
    if (error) return { error: "Adres kaydedilemedi, lütfen tekrar deneyin." };
  } else {
    // İlk eklenen adres otomatik olarak varsayılan olur
    const { count } = await supabase
      .from("customer_addresses")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", user.id);

    const { data, error } = await supabase
      .from("customer_addresses")
      .insert({ ...values, customer_id: user.id, is_default: (count ?? 0) === 0 })
      .select("id")
      .single();
    if (error) return { error: "Adres eklenemedi, lütfen tekrar deneyin." };
    savedId = data.id;
  }

  if (makeDefault && savedId) {
    await supabase.rpc("set_default_address", { p_address_id: savedId });
  }

  revalidatePath("/hesabim", "layout");
  return { success: "Adres kaydedildi." };
}

export async function deleteMyAddress(addressId: string): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Oturumunuz sona ermiş, lütfen tekrar giriş yapın." };

  const { data: deleted, error } = await supabase
    .from("customer_addresses")
    .delete()
    .eq("id", addressId)
    .eq("customer_id", user.id)
    .select("is_default")
    .maybeSingle();

  if (error) return { error: "Adres silinemedi." };

  // Varsayılan adres silindiyse kalanlardan en yenisi varsayılan olur
  if (deleted?.is_default) {
    const { data: next } = await supabase
      .from("customer_addresses")
      .select("id")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (next) await supabase.rpc("set_default_address", { p_address_id: next.id });
  }

  revalidatePath("/hesabim", "layout");
  return {};
}

export async function setMyDefaultAddress(addressId: string): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Oturumunuz sona ermiş, lütfen tekrar giriş yapın." };

  const { error } = await supabase.rpc("set_default_address", { p_address_id: addressId });
  if (error) return { error: "Varsayılan adres değiştirilemedi." };

  revalidatePath("/hesabim", "layout");
  return {};
}
