import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface HeroImage {
  id: string;
  imageUrl: string;
  position: number;
}

export const getHeroImages = cache(async (): Promise<HeroImage[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hero_images")
    .select("id, image_url, position")
    .order("position", { ascending: true });

  if (error) {
    console.error("getHeroImages error:", error.message);
    return [];
  }

  return data.map((row) => ({ id: row.id, imageUrl: row.image_url, position: row.position }));
});
