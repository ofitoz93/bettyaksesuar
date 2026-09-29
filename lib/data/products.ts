import { createClient } from "@/lib/supabase/server";
import type { Product, ProductCategory } from "@/lib/types";

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  compare_at_price: number | null;
  discount_percent: number | null;
  is_new: boolean;
  is_best_seller: boolean;
  description: string | null;
  stock: number;
  product_images: { url: string; position: number }[] | null;
}

const PRODUCT_SELECT = "*, product_images(url, position)";

function mapRow(row: ProductRow): Product {
  const images = (row.product_images ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((img) => img.url);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price !== null ? Number(row.compare_at_price) : null,
    discountPercent: row.discount_percent,
    isNew: row.is_new,
    isBestSeller: row.is_best_seller,
    description: row.description,
    images,
    stock: row.stock,
  };
}

export async function getProducts(
  category?: ProductCategory,
  search?: string,
): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false })
    .order("position", { foreignTable: "product_images", ascending: true });

  if (category) {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getProducts error:", error.message);
    return [];
  }
  return (data as ProductRow[]).map(mapRow);
}

export async function getBestSellers(limit = 4): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_best_seller", true)
    .order("created_at", { ascending: false })
    .order("position", { foreignTable: "product_images", ascending: true })
    .limit(limit);

  if (error) {
    console.error("getBestSellers error:", error.message);
    return [];
  }
  return (data as ProductRow[]).map(mapRow);
}

export async function getNewArrivals(limit = 20): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false })
    .order("position", { foreignTable: "product_images", ascending: true })
    .limit(limit);

  if (error) {
    console.error("getNewArrivals error:", error.message);
    return [];
  }
  return (data as ProductRow[]).map(mapRow);
}

export async function getDiscountedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .or("discount_percent.gt.0,compare_at_price.not.is.null")
    .order("created_at", { ascending: false })
    .order("position", { foreignTable: "product_images", ascending: true });

  if (error) {
    console.error("getDiscountedProducts error:", error.message);
    return [];
  }
  return (data as ProductRow[]).map(mapRow);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("position", { foreignTable: "product_images", ascending: true })
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getProductBySlug error:", error.message);
    return null;
  }
  return mapRow(data as ProductRow);
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("position", { foreignTable: "product_images", ascending: true })
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getProductById error:", error.message);
    return null;
  }
  return mapRow(data as ProductRow);
}

export interface ProductImageRow {
  id: string;
  url: string;
  position: number;
}

export async function getProductImages(productId: string): Promise<ProductImageRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("id, url, position")
    .eq("product_id", productId)
    .order("position", { ascending: true });

  if (error) {
    console.error("getProductImages error:", error.message);
    return [];
  }
  return data;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("position", { foreignTable: "product_images", ascending: true })
    .in("id", ids);

  if (error) {
    console.error("getProductsByIds error:", error.message);
    return [];
  }
  return (data as ProductRow[]).map(mapRow);
}
