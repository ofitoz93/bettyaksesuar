import { createClient } from "@/lib/supabase/server";

export interface SocialFeedImage {
  id: string;
  imageUrl: string;
  position: number;
}

export async function getSocialFeedImages(): Promise<SocialFeedImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("social_feed_images")
    .select("id, image_url, position")
    .order("position", { ascending: true });

  if (error) {
    console.error("getSocialFeedImages error:", error.message);
    return [];
  }

  return data.map((row) => ({ id: row.id, imageUrl: row.image_url, position: row.position }));
}
