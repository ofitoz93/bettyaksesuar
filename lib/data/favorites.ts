import { createClient } from "@/lib/supabase/server";
import { getProductsByIds } from "./products";
import type { Product } from "@/lib/types";

export async function getFavoriteProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", user.id);

  if (error || !data || data.length === 0) return [];

  return getProductsByIds(data.map((row) => row.product_id));
}
