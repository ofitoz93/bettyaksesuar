import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ProductCategory } from "@/lib/types";

export const getCategoryImages = cache(
  async (): Promise<Partial<Record<ProductCategory, string>>> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("category_images")
      .select("category, image_url");

    if (error || !data) {
      return {};
    }

    const map: Partial<Record<ProductCategory, string>> = {};
    for (const row of data) {
      if (row.image_url) {
        map[row.category as ProductCategory] = row.image_url;
      }
    }
    return map;
  },
);
