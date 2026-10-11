"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { EXPENSE_CATEGORIES } from "@/lib/finance";

// Gider ve alış fiyatı işlemleri. Tablolar yalnızca admin'e açık (RLS), bu yüzden
// admin olmayan bir oturumda yazma işlemleri veritabanında reddedilir.

export interface ExpenseFormState {
  error?: string;
  success?: boolean;
  // Formu temizlemek için her başarılı kayıtta değişir
  savedAt?: number;
}

function revalidateFinance() {
  revalidatePath("/admin/giderler");
  revalidatePath("/admin/kar-zarar");
}

export async function addExpense(
  _prevState: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const date = String(formData.get("date") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const amount = Number(String(formData.get("amount") ?? "").replace(",", "."));
  const description = String(formData.get("description") ?? "").trim().slice(0, 300);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Geçerli bir tarih seçin." };
  if (!(category in EXPENSE_CATEGORIES)) return { error: "Bir gider türü seçin." };
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) {
    return { error: "Geçerli bir tutar girin." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("expenses").insert({
    expense_date: date,
    category,
    amount: Math.round(amount * 100) / 100,
    description: description || null,
  });
  if (error) return { error: `Gider kaydedilemedi: ${error.message}` };

  revalidateFinance();
  return { success: true, savedAt: Date.now() };
}

export async function deleteExpense(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { error: `Gider silinemedi: ${error.message}` };
  revalidateFinance();
  return {};
}

export async function saveCostPrices(
  entries: { productId: string; costPrice: number | null }[],
): Promise<{ error?: string; saved?: number }> {
  if (entries.length === 0) return { saved: 0 };
  if (entries.length > 1000) return { error: "Tek seferde en fazla 1000 ürün kaydedilebilir." };

  const toUpsert: { product_id: string; cost_price: number; updated_at: string }[] = [];
  const toDelete: string[] = [];
  const now = new Date().toISOString();
  for (const entry of entries) {
    if (entry.costPrice === null) {
      toDelete.push(entry.productId);
    } else if (Number.isFinite(entry.costPrice) && entry.costPrice >= 0 && entry.costPrice < 10_000_000) {
      toUpsert.push({
        product_id: entry.productId,
        cost_price: Math.round(entry.costPrice * 100) / 100,
        updated_at: now,
      });
    } else {
      return { error: "Alış fiyatları 0 veya daha büyük bir sayı olmalı." };
    }
  }

  const supabase = await createClient();
  if (toUpsert.length > 0) {
    const { error } = await supabase.from("product_costs").upsert(toUpsert);
    if (error) return { error: `Alış fiyatları kaydedilemedi: ${error.message}` };
  }
  if (toDelete.length > 0) {
    const { error } = await supabase.from("product_costs").delete().in("product_id", toDelete);
    if (error) return { error: `Alış fiyatları kaydedilemedi: ${error.message}` };
  }

  revalidatePath("/admin/alis-fiyatlari");
  revalidatePath("/admin/kar-zarar");
  revalidatePath("/admin/urunler");
  return { saved: entries.length };
}
