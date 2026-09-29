"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
