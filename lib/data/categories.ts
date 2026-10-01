import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

export interface Category {
  slug: string;
  name: string;
  description: string;
  parentSlug: string | null;
  imageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  sortOrder: number;
}

export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    slug: row.slug,
    name: row.name,
    description: row.description,
    parentSlug: row.parent_slug,
    imageUrl: row.image_url,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    metaKeywords: row.meta_keywords,
    sortOrder: row.sort_order,
  }));
});

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export function getRootCategories(categories: Category[]): Category[] {
  return categories.filter((c) => !c.parentSlug);
}

export function getChildCategories(categories: Category[], parentSlug: string): Category[] {
  return categories.filter((c) => c.parentSlug === parentSlug);
}

export function categoryLabelMap(categories: Category[]): Record<string, string> {
  return Object.fromEntries(categories.map((c) => [c.slug, c.name]));
}
