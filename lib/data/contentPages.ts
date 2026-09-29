import { createClient } from "@/lib/supabase/server";

export interface ContentPage {
  slug: string;
  title: string;
  body: string;
}

export async function getContentPage(slug: string): Promise<ContentPage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_pages")
    .select("slug, title, body")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data;
}

export async function getAllContentPages(): Promise<ContentPage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_pages")
    .select("slug, title, body")
    .order("title", { ascending: true });

  if (error) {
    console.error("getAllContentPages error:", error.message);
    return [];
  }
  return data;
}
