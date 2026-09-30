import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const SIGNED_URL_TTL = 60 * 60;
const BUCKET = "wholesale-images";

async function signPaths(
  supabase: SupabaseServerClient,
  paths: string[],
  download = false,
): Promise<(string | null)[]> {
  if (paths.length === 0) return [];

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL, download ? { download: true } : undefined);

  if (error || !data) {
    console.error("wholesale image sign error:", error?.message);
    return paths.map(() => null);
  }
  return data.map((entry) => entry.signedUrl ?? null);
}

interface WholesaleProductRow {
  id: string;
  name: string;
  sku: string | null;
  created_at: string;
  wholesale_product_images: { path: string; position: number }[] | null;
}

export interface WholesaleProductListItem {
  id: string;
  name: string;
  sku: string | null;
  createdAt: string;
  imageCount: number;
  thumbnailUrl: string | null;
}

export async function getWholesaleProducts(): Promise<WholesaleProductListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wholesale_products")
    .select("id, name, sku, created_at, wholesale_product_images(path, position)")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("getWholesaleProducts error:", error?.message);
    return [];
  }

  const rows = data as unknown as WholesaleProductRow[];

  return Promise.all(
    rows.map(async (row) => {
      const images = (row.wholesale_product_images ?? [])
        .slice()
        .sort((a, b) => a.position - b.position);
      const thumbnailPath = images[0]?.path;
      const [thumbnailUrl] = thumbnailPath ? await signPaths(supabase, [thumbnailPath]) : [null];

      return {
        id: row.id,
        name: row.name,
        sku: row.sku,
        createdAt: row.created_at,
        imageCount: images.length,
        thumbnailUrl,
      };
    }),
  );
}

export interface WholesaleProductDetail {
  id: string;
  name: string;
  sku: string | null;
  createdAt: string;
}

export async function getWholesaleProductById(
  id: string,
): Promise<WholesaleProductDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wholesale_products")
    .select("id, name, sku, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getWholesaleProductById error:", error.message);
    return null;
  }

  return { id: data.id, name: data.name, sku: data.sku, createdAt: data.created_at };
}

export interface WholesaleProductImage {
  id: string;
  url: string;
  downloadUrl: string;
}

export async function getWholesaleProductImages(
  productId: string,
): Promise<WholesaleProductImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wholesale_product_images")
    .select("id, path, position")
    .eq("wholesale_product_id", productId)
    .order("position", { ascending: true });

  if (error || !data) {
    if (error) console.error("getWholesaleProductImages error:", error.message);
    return [];
  }

  const paths = data.map((row) => row.path);
  const [viewUrls, downloadUrls] = await Promise.all([
    signPaths(supabase, paths),
    signPaths(supabase, paths, true),
  ]);

  return data
    .map((row, index) => ({
      id: row.id,
      url: viewUrls[index] ?? "",
      downloadUrl: downloadUrls[index] ?? viewUrls[index] ?? "",
    }))
    .filter((img) => img.url.length > 0);
}
