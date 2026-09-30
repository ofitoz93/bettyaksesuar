"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { notifyBackInStockCustomers } from "@/lib/data/stockNotifications";
import { fetchTcmbUsdRate } from "@/lib/tcmb";
import { sendEmail } from "@/lib/email";
import { statusLabel } from "@/lib/orders";
import type { ProductCategory } from "@/lib/types";

export interface ActionState {
  error?: string;
}

export async function login(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "E-posta veya şifre hatalı." };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

function readProductFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const category = String(formData.get("category") ?? "") as ProductCategory;
  const price = Number(formData.get("price"));
  const compareAtPriceRaw = String(formData.get("compareAtPrice") ?? "").trim();
  const compareAtPrice = compareAtPriceRaw ? Number(compareAtPriceRaw) : null;
  const stock = Number(formData.get("stock") ?? 0);
  const costPriceRaw = String(formData.get("costPrice") ?? "").trim();
  const costPrice = costPriceRaw ? Number(costPriceRaw) : null;
  const sku = String(formData.get("sku") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim();
  const isNew = formData.get("isNew") === "on";
  const isBestSeller = formData.get("isBestSeller") === "on";
  const isActive = formData.get("isActive") === "on";
  const metaTitle = String(formData.get("metaTitle") ?? "").trim();
  const metaDescription = String(formData.get("metaDescription") ?? "").trim();
  const metaKeywords = String(formData.get("metaKeywords") ?? "").trim();
  const taxClassPercentRaw = String(formData.get("taxClassPercent") ?? "20").trim();
  const taxClassPercent = taxClassPercentRaw ? Number(taxClassPercentRaw) : 20;

  // İndirim yüzdesi elle girilmiyor — fiyat ile eski fiyattan otomatik hesaplanır,
  // böylece ikisi asla birbiriyle tutarsız olamaz.
  const discountPercent =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null;

  return {
    name,
    slug: rawSlug ? slugify(rawSlug) : slugify(name),
    category,
    price,
    compareAtPrice,
    discountPercent,
    stock: Number.isFinite(stock) ? stock : 0,
    costPrice,
    sku,
    description: description || null,
    isNew,
    isBestSeller,
    isActive,
    metaTitle: metaTitle || null,
    metaDescription: metaDescription || null,
    metaKeywords: metaKeywords || null,
    taxClassPercent: Number.isFinite(taxClassPercent) ? taxClassPercent : 20,
  };
}

async function uploadImages(
  formData: FormData,
  slug: string,
  fieldName = "images",
): Promise<string[]> {
  const files = formData
    .getAll(fieldName)
    .filter((f): f is File => f instanceof File && f.size > 0);
  return uploadImageFiles(files, slug);
}

async function uploadImageFiles(files: File[], slug: string): Promise<string[]> {
  const supabase = await createClient();

  const urls: string[] = [];
  for (const file of files) {
    const extension = file.name.split(".").pop() ?? "jpg";
    const path = `${slug}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

    const { error } = await supabase.storage.from("product-images").upload(path, file);

    if (error) {
      console.error("uploadImages error:", error.message);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(path);
    urls.push(publicUrl);
  }

  return urls;
}

async function uploadSingleImage(
  formData: FormData,
  fieldName: string,
  pathPrefix: string,
): Promise<string | null> {
  const supabase = await createClient();
  const file = formData.get(fieldName);

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${pathPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const { error } = await supabase.storage.from("product-images").upload(path, file);
  if (error) {
    console.error("uploadSingleImage error:", error.message);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(path);
  return publicUrl;
}

async function uploadMainAndGalleryImages(formData: FormData, slug: string): Promise<string[]> {
  const mainUrl = await uploadSingleImage(formData, "mainImage", `${slug}-main`);
  const galleryFiles = formData
    .getAll("galleryImages")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const galleryUrls = await uploadImageFiles(galleryFiles, slug);

  return [mainUrl, ...galleryUrls].filter((url): url is string => Boolean(url));
}

export async function setMainProductImage(productId: string, imageId: string) {
  const supabase = await createClient();

  const { data: currentMain } = await supabase
    .from("product_images")
    .select("id, position")
    .eq("product_id", productId)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!currentMain || currentMain.id === imageId) {
    return;
  }

  const { data: target } = await supabase
    .from("product_images")
    .select("position")
    .eq("id", imageId)
    .maybeSingle();

  if (!target) return;

  await supabase.from("product_images").update({ position: currentMain.position }).eq("id", imageId);
  await supabase.from("product_images").update({ position: target.position }).eq("id", currentMain.id);

  revalidatePath(`/admin/urun/${productId}`);
  revalidatePath("/admin/urunler");
  revalidatePath("/magaza");
}

export async function createProduct(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fields = readProductFields(formData);

  if (!fields.name || !fields.category || !Number.isFinite(fields.price)) {
    return { error: "Lütfen ürün adı, kategori ve fiyatı doldurun." };
  }

  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      slug: fields.slug,
      name: fields.name,
      category: fields.category,
      price: fields.price,
      compare_at_price: fields.compareAtPrice,
      discount_percent: fields.discountPercent,
      stock: fields.stock,
      cost_price: fields.costPrice,
      sku: fields.sku,
      description: fields.description,
      is_new: fields.isNew,
      is_best_seller: fields.isBestSeller,
      is_active: fields.isActive,
      meta_title: fields.metaTitle,
      meta_description: fields.metaDescription,
      meta_keywords: fields.metaKeywords,
      tax_class_percent: fields.taxClassPercent,
    })
    .select("id")
    .single();

  if (error || !product) {
    return { error: `Ürün eklenemedi: ${error?.message ?? "bilinmeyen hata"}` };
  }

  const imageUrls = await uploadMainAndGalleryImages(formData, fields.slug);
  if (imageUrls.length > 0) {
    await supabase.from("product_images").insert(
      imageUrls.map((url, index) => ({
        product_id: product.id,
        url,
        position: index,
      })),
    );
  }

  revalidatePath("/admin/urunler");
  revalidatePath("/magaza");
  revalidatePath("/");
  redirect("/admin/urunler");
}

async function uploadWholesaleImageFiles(files: File[], prefix: string): Promise<string[]> {
  const supabase = await createClient();
  const paths: string[] = [];

  for (const file of files) {
    const extension = file.name.split(".").pop() ?? "jpg";
    const path = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

    const { error } = await supabase.storage.from("wholesale-images").upload(path, file);
    if (error) {
      console.error("uploadWholesaleImageFiles error:", error.message);
      continue;
    }

    paths.push(path);
  }

  return paths;
}

export interface BulkWholesaleResult {
  name: string;
  error?: string;
}

export interface BulkWholesaleActionState {
  results?: BulkWholesaleResult[];
}

export async function bulkCreateWholesaleProducts(
  _prevState: BulkWholesaleActionState,
  formData: FormData,
): Promise<BulkWholesaleActionState> {
  const rowIds = formData.getAll("rowIds").map(String);
  const supabase = await createClient();
  const results: BulkWholesaleResult[] = [];

  for (const id of rowIds) {
    const name = String(formData.get(`name-${id}`) ?? "").trim();
    const sku = String(formData.get(`sku-${id}`) ?? "").trim() || null;
    const files = formData
      .getAll(`images-${id}`)
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (!name && !sku && files.length === 0) {
      // Boş bırakılmış satır — sessizce atla.
      continue;
    }

    if (!name) {
      results.push({ name: "(isimsiz satır)", error: "Ürün adı zorunlu" });
      continue;
    }

    const { data: product, error } = await supabase
      .from("wholesale_products")
      .insert({ name, sku })
      .select("id")
      .single();

    if (error || !product) {
      results.push({ name, error: error?.message ?? "kaydedilemedi" });
      continue;
    }

    const paths = await uploadWholesaleImageFiles(files, product.id);
    if (paths.length > 0) {
      await supabase.from("wholesale_product_images").insert(
        paths.map((path, index) => ({
          wholesale_product_id: product.id,
          path,
          position: index,
        })),
      );
    }

    results.push({ name });
  }

  revalidatePath("/admin/toptanci");

  return { results };
}

export async function deleteWholesaleProduct(id: string) {
  const supabase = await createClient();

  const { data: images } = await supabase
    .from("wholesale_product_images")
    .select("path")
    .eq("wholesale_product_id", id);

  if (images && images.length > 0) {
    await supabase.storage.from("wholesale-images").remove(images.map((img) => img.path));
  }

  await supabase.from("wholesale_products").delete().eq("id", id);

  revalidatePath("/admin/toptanci");
}

export async function updateProduct(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fields = readProductFields(formData);

  if (!fields.name || !fields.category || !Number.isFinite(fields.price)) {
    return { error: "Lütfen ürün adı, kategori ve fiyatı doldurun." };
  }

  const supabase = await createClient();

  const { data: existingProduct } = await supabase
    .from("products")
    .select("stock")
    .eq("id", id)
    .maybeSingle();
  const wasOutOfStock = !existingProduct || (existingProduct.stock ?? 0) <= 0;

  const { error } = await supabase
    .from("products")
    .update({
      slug: fields.slug,
      name: fields.name,
      category: fields.category,
      price: fields.price,
      compare_at_price: fields.compareAtPrice,
      discount_percent: fields.discountPercent,
      stock: fields.stock,
      cost_price: fields.costPrice,
      sku: fields.sku,
      description: fields.description,
      is_new: fields.isNew,
      is_best_seller: fields.isBestSeller,
      is_active: fields.isActive,
      meta_title: fields.metaTitle,
      meta_description: fields.metaDescription,
      meta_keywords: fields.metaKeywords,
      tax_class_percent: fields.taxClassPercent,
    })
    .eq("id", id);

  if (error) {
    return { error: `Ürün güncellenemedi: ${error.message}` };
  }

  if (wasOutOfStock && fields.stock > 0) {
    try {
      await notifyBackInStockCustomers(id, fields.name, fields.slug);
    } catch (err) {
      console.error("notifyBackInStockCustomers error:", err);
    }
  }

  const deleteIds = formData.getAll("deleteImageIds").map(String).filter(Boolean);
  if (deleteIds.length > 0) {
    await supabase.from("product_images").delete().in("id", deleteIds);
  }

  const { count: remainingCount } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id);

  const imageUrls = await uploadImages(formData, fields.slug);
  if (imageUrls.length > 0) {
    const startPosition = remainingCount ?? 0;
    await supabase.from("product_images").insert(
      imageUrls.map((url, index) => ({
        product_id: id,
        url,
        position: startPosition + index,
      })),
    );
  }

  revalidatePath("/admin/urunler");
  revalidatePath("/magaza");
  revalidatePath("/");
  redirect("/admin/urunler");
}

export async function duplicateProduct(id: string) {
  const supabase = await createClient();

  const { data: original, error: fetchError } = await supabase
    .from("products")
    .select("*, product_images(url, position)")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !original) {
    return;
  }

  const newSlug = `${original.slug}-kopya-${Date.now().toString(36)}`;

  const { product_images: originalImages, ...rest } = original;
  delete rest.id;
  delete rest.created_at;
  delete rest.updated_at;

  const { data: copy, error: insertError } = await supabase
    .from("products")
    .insert({
      ...rest,
      slug: newSlug,
      name: `${original.name} (Kopya)`,
      is_active: false,
    })
    .select("id")
    .single();

  if (insertError || !copy) {
    return;
  }

  const images = (originalImages ?? []) as { url: string; position: number }[];
  if (images.length > 0) {
    await supabase.from("product_images").insert(
      images.map((img) => ({ product_id: copy.id, url: img.url, position: img.position })),
    );
  }

  revalidatePath("/admin/urunler");
  redirect(`/admin/urun/${copy.id}`);
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);

  revalidatePath("/admin/urunler");
  revalidatePath("/magaza");
  revalidatePath("/");
}

export async function updateShippingSettings(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const freeShippingThreshold = Number(formData.get("freeShippingThreshold"));
  const standardShippingFee = Number(formData.get("standardShippingFee"));
  const perItemFee = Number(formData.get("perItemFee"));

  if (
    !Number.isFinite(freeShippingThreshold) ||
    !Number.isFinite(standardShippingFee) ||
    !Number.isFinite(perItemFee)
  ) {
    return { error: "Lütfen geçerli sayılar girin." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("shipping_settings")
    .update({
      free_shipping_threshold: freeShippingThreshold,
      standard_shipping_fee: standardShippingFee,
      per_item_fee: perItemFee,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return { error: `Ayarlar kaydedilemedi: ${error.message}` };
  }

  revalidatePath("/admin/ayarlar");
  revalidatePath("/sepet");
  revalidatePath("/odeme");
  return {};
}

export async function updateSiteSettings(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const siteName = String(formData.get("siteName") ?? "").trim();
  const siteTagline = String(formData.get("siteTagline") ?? "").trim();
  const announcementText = String(formData.get("announcementText") ?? "").trim();
  const heroEyebrow = String(formData.get("heroEyebrow") ?? "").trim();
  const heroHeading = String(formData.get("heroHeading") ?? "").trim();
  const heroSubtitle = String(formData.get("heroSubtitle") ?? "").trim();
  const heroPrimaryLabel = String(formData.get("heroPrimaryLabel") ?? "").trim();
  const heroPrimaryHref = String(formData.get("heroPrimaryHref") ?? "").trim();
  const heroSecondaryLabel = String(formData.get("heroSecondaryLabel") ?? "").trim();
  const heroSecondaryHref = String(formData.get("heroSecondaryHref") ?? "").trim();
  const instagramUrl = String(formData.get("instagramUrl") ?? "").trim();
  const facebookUrl = String(formData.get("facebookUrl") ?? "").trim();
  const pinterestUrl = String(formData.get("pinterestUrl") ?? "").trim();
  const campaignEyebrow = String(formData.get("campaignEyebrow") ?? "").trim();
  const campaignHeading = String(formData.get("campaignHeading") ?? "").trim();
  const campaignBody = String(formData.get("campaignBody") ?? "").trim();
  const campaignButtonLabel = String(formData.get("campaignButtonLabel") ?? "").trim();
  const campaignEnabled = formData.get("campaignEnabled") === "on";
  const engravingEyebrow = String(formData.get("engravingEyebrow") ?? "").trim();
  const engravingHeading = String(formData.get("engravingHeading") ?? "").trim();
  const engravingBody = String(formData.get("engravingBody") ?? "").trim();
  const engravingButtonLabel = String(formData.get("engravingButtonLabel") ?? "").trim();
  const engravingEnabled = formData.get("engravingEnabled") === "on";

  if (
    !siteName ||
    !siteTagline ||
    !announcementText ||
    !heroEyebrow ||
    !heroHeading ||
    !heroSubtitle ||
    !heroPrimaryLabel ||
    !heroPrimaryHref ||
    !heroSecondaryLabel ||
    !heroSecondaryHref ||
    !campaignEyebrow ||
    !campaignHeading ||
    !campaignBody ||
    !campaignButtonLabel ||
    !engravingEyebrow ||
    !engravingHeading ||
    !engravingBody ||
    !engravingButtonLabel
  ) {
    return { error: "Lütfen tüm zorunlu alanları doldurun." };
  }

  const logoUrl = await uploadSingleImage(formData, "logo", "logo");
  const campaignImageUrl = await uploadSingleImage(formData, "campaignImage", "campaign");
  const engravingImageUrl = await uploadSingleImage(formData, "engravingImage", "engraving");

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      site_name: siteName,
      site_tagline: siteTagline,
      announcement_text: announcementText,
      hero_eyebrow: heroEyebrow,
      hero_heading: heroHeading,
      hero_subtitle: heroSubtitle,
      hero_primary_label: heroPrimaryLabel,
      hero_primary_href: heroPrimaryHref,
      hero_secondary_label: heroSecondaryLabel,
      hero_secondary_href: heroSecondaryHref,
      instagram_url: instagramUrl || null,
      facebook_url: facebookUrl || null,
      pinterest_url: pinterestUrl || null,
      campaign_eyebrow: campaignEyebrow,
      campaign_heading: campaignHeading,
      campaign_body: campaignBody,
      campaign_button_label: campaignButtonLabel,
      campaign_enabled: campaignEnabled,
      engraving_eyebrow: engravingEyebrow,
      engraving_heading: engravingHeading,
      engraving_body: engravingBody,
      engraving_button_label: engravingButtonLabel,
      engraving_enabled: engravingEnabled,
      ...(logoUrl ? { logo_url: logoUrl } : {}),
      ...(campaignImageUrl ? { campaign_image_url: campaignImageUrl } : {}),
      ...(engravingImageUrl ? { engraving_image_url: engravingImageUrl } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/ayarlar/anasayfa");
  return {};
}

export async function updateTestimonialsEnabled(enabled: boolean) {
  const supabase = await createClient();
  await supabase.from("site_settings").update({ testimonials_enabled: enabled }).eq("id", 1);

  revalidatePath("/", "layout");
  revalidatePath("/admin/yorumlar");
}

export async function updateSocialFeedEnabled(enabled: boolean) {
  const supabase = await createClient();
  await supabase.from("site_settings").update({ social_feed_enabled: enabled }).eq("id", 1);

  revalidatePath("/", "layout");
  revalidatePath("/admin/ayarlar/sosyal-medya");
}

export interface CategoryActionState {
  error?: string;
}

export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const metaTitle = String(formData.get("metaTitle") ?? "").trim();
  const metaDescription = String(formData.get("metaDescription") ?? "").trim();
  const metaKeywords = String(formData.get("metaKeywords") ?? "").trim();
  const parentSlug = String(formData.get("parentSlug") ?? "").trim();

  if (!name) {
    return { error: "Kategori adı zorunlu." };
  }

  const slug = slugify(rawSlug || name);
  if (!slug) {
    return { error: "Geçerli bir SEO bağlantısı oluşturulamadı." };
  }

  const imageUrl = await uploadSingleImage(formData, "image", `category-${slug}`);

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    slug,
    name,
    description,
    parent_slug: parentSlug || null,
    meta_title: metaTitle || null,
    meta_description: metaDescription || null,
    meta_keywords: metaKeywords || null,
    image_url: imageUrl,
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Bu SEO bağlantısı zaten kullanılıyor, lütfen farklı bir tane girin."
          : `Kaydedilemedi: ${error.message}`,
    };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/ayarlar/kategoriler");
  redirect("/admin/ayarlar/kategoriler");
}

export async function updateCategory(
  slug: string,
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const metaTitle = String(formData.get("metaTitle") ?? "").trim();
  const metaDescription = String(formData.get("metaDescription") ?? "").trim();
  const metaKeywords = String(formData.get("metaKeywords") ?? "").trim();
  const parentSlug = String(formData.get("parentSlug") ?? "").trim();

  if (!name) {
    return { error: "Kategori adı zorunlu." };
  }

  if (parentSlug === slug) {
    return { error: "Bir kategori kendi alt kategorisi olamaz." };
  }

  const imageUrl = await uploadSingleImage(formData, "image", `category-${slug}`);

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name,
      description,
      parent_slug: parentSlug || null,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      meta_keywords: metaKeywords || null,
      updated_at: new Date().toISOString(),
      ...(imageUrl ? { image_url: imageUrl } : {}),
    })
    .eq("slug", slug);

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/ayarlar/kategoriler");
  redirect("/admin/ayarlar/kategoriler");
}

export async function deleteCategory(slug: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("slug", slug);

  if (error) {
    return {
      error:
        error.code === "23503"
          ? "Bu kategoriye bağlı ürünler olduğu için silinemiyor. Önce ürünleri başka bir kategoriye taşıyın."
          : `Silinemedi: ${error.message}`,
    };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/ayarlar/kategoriler");
  return {};
}

function readTestimonialFields(formData: FormData) {
  const author = String(formData.get("author") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 5);
  const position = Number(formData.get("position") ?? 0);

  return {
    author,
    quote,
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, rating)) : 5,
    position: Number.isFinite(position) ? position : 0,
  };
}

export async function createTestimonial(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fields = readTestimonialFields(formData);

  if (!fields.author || !fields.quote) {
    return { error: "Lütfen isim ve yorum metnini doldurun." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").insert(fields);

  if (error) {
    return { error: `Eklenemedi: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/admin/yorumlar");
  redirect("/admin/yorumlar");
}

export async function updateTestimonial(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fields = readTestimonialFields(formData);

  if (!fields.author || !fields.quote) {
    return { error: "Lütfen isim ve yorum metnini doldurun." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").update(fields).eq("id", id);

  if (error) {
    return { error: `Güncellenemedi: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/admin/yorumlar");
  redirect("/admin/yorumlar");
}

export async function deleteTestimonial(id: string) {
  const supabase = await createClient();
  await supabase.from("testimonials").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/admin/yorumlar");
}

export async function addSocialFeedImages(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const imageUrls = await uploadImages(formData, "social");

  if (imageUrls.length === 0) {
    return { error: "Lütfen en az bir görsel seçin." };
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("social_feed_images")
    .select("id", { count: "exact", head: true });

  const startPosition = count ?? 0;
  const { error } = await supabase.from("social_feed_images").insert(
    imageUrls.map((url, index) => ({ image_url: url, position: startPosition + index })),
  );

  if (error) {
    return { error: `Eklenemedi: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/admin/ayarlar/sosyal-medya");
  return {};
}

export async function removeSocialFeedImage(id: string) {
  const supabase = await createClient();
  await supabase.from("social_feed_images").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/admin/ayarlar/sosyal-medya");
}

const MAX_HERO_IMAGES = 5;

export async function addHeroImages(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("hero_images")
    .select("id", { count: "exact", head: true });

  const startPosition = count ?? 0;
  if (startPosition >= MAX_HERO_IMAGES) {
    return { error: `En fazla ${MAX_HERO_IMAGES} hero görseli ekleyebilirsiniz.` };
  }

  const imageUrls = await uploadImages(formData, "hero");

  if (imageUrls.length === 0) {
    return { error: "Lütfen en az bir görsel seçin." };
  }

  const allowedUrls = imageUrls.slice(0, MAX_HERO_IMAGES - startPosition);
  const { error } = await supabase.from("hero_images").insert(
    allowedUrls.map((url, index) => ({ image_url: url, position: startPosition + index })),
  );

  if (error) {
    return { error: `Eklenemedi: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/admin/ayarlar/anasayfa");
  return {};
}

export async function removeHeroImage(id: string) {
  const supabase = await createClient();
  await supabase.from("hero_images").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/admin/ayarlar/anasayfa");
}

export async function updateContentPage(
  slug: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!title) {
    return { error: "Lütfen başlık girin." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("content_pages")
    .update({ title, body, updated_at: new Date().toISOString() })
    .eq("slug", slug);

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  revalidatePath(`/${slug}`);
  revalidatePath(`/admin/ayarlar/sayfalar/${slug}`);
  return {};
}

export async function updatePromoPopupSettings(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const enabled = formData.get("enabled") === "on";
  const delaySeconds = Number(formData.get("delaySeconds"));
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const buttonLabel = String(formData.get("buttonLabel") ?? "").trim();
  const discountCode = String(formData.get("discountCode") ?? "").trim();
  const discountPercent = Number(formData.get("discountPercent"));

  if (
    !title ||
    !body ||
    !buttonLabel ||
    !discountCode ||
    !Number.isFinite(delaySeconds) ||
    !Number.isFinite(discountPercent)
  ) {
    return { error: "Lütfen tüm zorunlu alanları doldurun." };
  }

  const imageUrl = await uploadSingleImage(formData, "image", "promo");

  const supabase = await createClient();
  const { error } = await supabase
    .from("promo_popup_settings")
    .update({
      enabled,
      delay_seconds: Math.max(3, Math.round(delaySeconds)),
      title,
      body,
      button_label: buttonLabel,
      discount_code: discountCode,
      discount_percent: Math.min(90, Math.max(0, discountPercent)),
      ...(imageUrl ? { image_url: imageUrl } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/ayarlar/kampanya");
  return {};
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();
  await supabase.from("orders").update({ status }).eq("id", orderId);

  revalidatePath("/admin/siparisler");
  revalidatePath("/hesabim/siparislerim");
}

export async function updateOrderFulfillment(
  orderId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const status = String(formData.get("status") ?? "");
  const shippingCarrier = String(formData.get("shippingCarrier") ?? "").trim();
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  const notifyCustomer = formData.get("notifyCustomer") === "on";

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({
      status,
      shipping_carrier: shippingCarrier || null,
      tracking_number: trackingNumber || null,
    })
    .eq("id", orderId);

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  if (notifyCustomer) {
    const { data: order } = await supabase
      .from("orders")
      .select("order_number, guest_name, guest_email")
      .eq("id", orderId)
      .maybeSingle();

    if (order?.guest_email) {
      const trackingLine =
        shippingCarrier && trackingNumber
          ? `<p>Kargo firması: <strong>${shippingCarrier}</strong><br/>Takip numarası: <strong>${trackingNumber}</strong></p>`
          : "";

      await sendEmail({
        to: order.guest_email,
        subject: `Siparişiniz güncellendi — ${order.order_number}`,
        html: `<p>Merhaba ${order.guest_name},</p>
<p><strong>${order.order_number}</strong> numaralı siparişinizin durumu güncellendi: <strong>${statusLabel(status)}</strong></p>
${trackingLine}
<p>Siparişinizi hesabınızdan takip edebilirsiniz.</p>`,
      }).catch((err) => console.error("updateOrderFulfillment notify error:", err));
    }
  }

  revalidatePath("/admin/siparisler");
  revalidatePath("/hesabim/siparislerim");
  return {};
}

export async function createReturnRequest(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const orderId = String(formData.get("orderId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!reason) {
    return { error: "Lütfen iade nedeninizi yazın." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "İade talebi oluşturmak için giriş yapmalısınız." };
  }

  const { error } = await supabase.from("return_requests").insert({
    order_id: orderId,
    customer_id: user.id,
    reason,
  });

  if (error) {
    return { error: `İade talebi oluşturulamadı: ${error.message}` };
  }

  revalidatePath("/hesabim/siparislerim");
  revalidatePath("/admin/iadeler");
  return {};
}

export async function updateReturnRequestStatus(
  requestId: string,
  status: string,
  adminNote?: string,
) {
  const supabase = await createClient();
  await supabase
    .from("return_requests")
    .update({
      status,
      admin_note: adminNote || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  revalidatePath("/admin/iadeler");
  revalidatePath("/hesabim/siparislerim");
}

export async function closeStockNotification(id: string) {
  const supabase = await createClient();
  await supabase
    .from("stock_notifications")
    .update({ notified_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/stok-talepleri");
  revalidatePath("/admin");
}

// ============ EKLENTİLER: ÖDEME YÖNTEMLERİ ============

export async function updatePaymentMethod(
  code: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const label = String(formData.get("label") ?? "").trim();
  const enabled = formData.get("enabled") === "on";
  const extraDiscountPercent = Number(formData.get("extraDiscountPercent") ?? 0);

  if (!label) {
    return { error: "Ödeme yöntemi adı zorunlu." };
  }

  if (!Number.isFinite(extraDiscountPercent) || extraDiscountPercent < 0) {
    return { error: "İndirim yüzdesi geçerli bir sayı olmalı." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("payment_methods")
    .update({ label, enabled, extra_discount_percent: extraDiscountPercent })
    .eq("code", code);

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  revalidatePath("/admin/eklentiler");
  revalidatePath("/odeme");
  return {};
}

// ============ BLOG YÖNETİMİ ============

function readBlogFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const metaTitle = String(formData.get("metaTitle") ?? "").trim();
  const metaDescription = String(formData.get("metaDescription") ?? "").trim();
  const metaKeywords = String(formData.get("metaKeywords") ?? "").trim();
  const isPublished = formData.get("isPublished") === "on";

  return {
    title,
    slug: slugify(rawSlug || title),
    excerpt: excerpt || null,
    content,
    author: author || null,
    metaTitle: metaTitle || null,
    metaDescription: metaDescription || null,
    metaKeywords: metaKeywords || null,
    isPublished,
  };
}

export async function createBlogPost(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fields = readBlogFields(formData);

  if (!fields.title || !fields.slug) {
    return { error: "Başlık zorunlu." };
  }

  const imageUrl = await uploadSingleImage(formData, "image", `blog-${fields.slug}`);

  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").insert({
    title: fields.title,
    slug: fields.slug,
    excerpt: fields.excerpt,
    content: fields.content,
    author: fields.author,
    meta_title: fields.metaTitle,
    meta_description: fields.metaDescription,
    meta_keywords: fields.metaKeywords,
    is_published: fields.isPublished,
    image_url: imageUrl,
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Bu SEO bağlantısı zaten kullanılıyor."
          : `Kaydedilemedi: ${error.message}`,
    };
  }

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function updateBlogPost(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fields = readBlogFields(formData);

  if (!fields.title) {
    return { error: "Başlık zorunlu." };
  }

  const imageUrl = await uploadSingleImage(formData, "image", `blog-${fields.slug}`);

  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({
      title: fields.title,
      excerpt: fields.excerpt,
      content: fields.content,
      author: fields.author,
      meta_title: fields.metaTitle,
      meta_description: fields.metaDescription,
      meta_keywords: fields.metaKeywords,
      is_published: fields.isPublished,
      updated_at: new Date().toISOString(),
      ...(imageUrl ? { image_url: imageUrl } : {}),
    })
    .eq("id", id);

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${fields.slug}`);
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function deleteBlogPost(id: string) {
  const supabase = await createClient();
  await supabase.from("blog_posts").delete().eq("id", id);

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
}

// ============ TEMA DÜZENİ: HEADER / FOOTER ============

function parseNavLinks(raw: string): { label: string; href: string }[] | null {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed
      .map((item) => ({ label: String(item.label ?? "").trim(), href: String(item.href ?? "").trim() }))
      .filter((item) => item.label && item.href);
  } catch {
    return null;
  }
}

export async function updateHeaderLinks(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const primaryLinks = parseNavLinks(String(formData.get("headerPrimaryLinks") ?? "[]"));
  const secondaryLinks = parseNavLinks(String(formData.get("headerSecondaryLinks") ?? "[]"));

  if (!primaryLinks || !secondaryLinks) {
    return { error: "Menü linkleri okunamadı, lütfen tekrar deneyin." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      header_primary_links: primaryLinks,
      header_secondary_links: secondaryLinks,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/tema/header");
  return {};
}

export async function updateFooterContent(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const description = String(formData.get("footerDescription") ?? "").trim();
  const helpLinks = parseNavLinks(String(formData.get("footerHelpLinks") ?? "[]"));
  const companyLinks = parseNavLinks(String(formData.get("footerCompanyLinks") ?? "[]"));

  if (!description) {
    return { error: "Footer açıklaması boş bırakılamaz." };
  }

  if (!helpLinks || !companyLinks) {
    return { error: "Menü linkleri okunamadı, lütfen tekrar deneyin." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      footer_description: description,
      footer_help_links: helpLinks,
      footer_company_links: companyLinks,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/tema/footer");
  return {};
}

export async function updateWhatsAppSettings(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const enabled = formData.get("whatsappEnabled") === "on";
  const phone = String(formData.get("whatsappPhone") ?? "").trim();
  const defaultMessage = String(formData.get("whatsappDefaultMessage") ?? "").trim();
  const productMessage = String(formData.get("whatsappProductMessage") ?? "").trim();

  if (enabled && !phone) {
    return { error: "Modülü etkinleştirmek için bir WhatsApp numarası girmelisiniz." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("store_settings")
    .update({
      whatsapp_enabled: enabled,
      whatsapp_phone: phone || null,
      whatsapp_default_message: defaultMessage || "Merhaba, ürünleriniz hakkında bilgi almak istiyorum.",
      whatsapp_product_message:
        productMessage || "Merhaba, {urun_adi} adlı ürünle ilgileniyorum: {urun_linki}",
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/eklentiler/whatsapp");
  return {};
}

// ============ SİSTEM AYARLARI ============

export async function updateProfileSettings(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "").trim();

  if (!fullName || !email) {
    return { error: "Ad soyad ve e-posta zorunlu." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Oturum bulunamadı." };
  }

  const authUpdate: { email?: string; password?: string } = {};
  if (email !== user.email) authUpdate.email = email;
  if (newPassword) {
    if (newPassword.length < 6) {
      return { error: "Yeni parola en az 6 karakter olmalı." };
    }
    authUpdate.password = newPassword;
  }

  if (Object.keys(authUpdate).length > 0) {
    const { error: authError } = await supabase.auth.updateUser(authUpdate);
    if (authError) {
      return { error: `Hesap güncellenemedi: ${authError.message}` };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username: username || null, full_name: fullName, phone: phone || null })
    .eq("id", user.id);

  if (error) {
    return { error: `Profil güncellenemedi: ${error.message}` };
  }

  revalidatePath("/admin", "layout");
  return {};
}

export async function updateStoreIdentity(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const storeName = String(formData.get("storeName") ?? "").trim();
  const storeOwner = String(formData.get("storeOwner") ?? "").trim();
  const storeAddress = String(formData.get("storeAddress") ?? "").trim();
  const storeEmail = String(formData.get("storeEmail") ?? "").trim();
  const storePhone = String(formData.get("storePhone") ?? "").trim();

  if (!storeName) {
    return { error: "Mağaza adı zorunlu." };
  }

  const logoUrl = await uploadSingleImage(formData, "logo", "logo");

  const supabase = await createClient();
  const { error } = await supabase
    .from("store_settings")
    .update({
      store_name: storeName,
      store_owner: storeOwner || null,
      store_address: storeAddress || null,
      store_email: storeEmail || null,
      store_phone: storePhone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  if (logoUrl) {
    await supabase.from("site_settings").update({ logo_url: logoUrl }).eq("id", 1);
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/sistem/magaza");
  return {};
}

export async function updateStoreMeta(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const metaTitle = String(formData.get("metaTitle") ?? "").trim();
  const metaDescription = String(formData.get("metaDescription") ?? "").trim();
  const metaKeywords = String(formData.get("metaKeywords") ?? "").trim();

  if (!metaTitle) {
    return { error: "Meta başlık zorunlu." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("store_settings")
    .update({
      meta_title: metaTitle,
      meta_description: metaDescription || null,
      meta_keywords: metaKeywords || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/sistem/genel");
  return {};
}

export async function updateStoreLocale(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const localeCountry = String(formData.get("localeCountry") ?? "").trim();
  const localeRegion = String(formData.get("localeRegion") ?? "").trim();
  const localeCity = String(formData.get("localeCity") ?? "").trim();
  const currencyCode = String(formData.get("currencyCode") ?? "").trim();
  const currencySymbol = String(formData.get("currencySymbol") ?? "").trim();

  if (!localeCountry || !currencyCode || !currencySymbol) {
    return { error: "Ülke, para birimi kodu ve simgesi zorunlu." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("store_settings")
    .update({
      locale_country: localeCountry,
      locale_region: localeRegion || null,
      locale_city: localeCity || null,
      currency_code: currencyCode.toUpperCase(),
      currency_symbol: currencySymbol,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/sistem/yerel");
  return {};
}

export async function refreshExchangeRate(): Promise<ActionState> {
  const rate = await fetchTcmbUsdRate();

  if (!rate) {
    return { error: "TCMB kur bilgisi şu anda alınamadı, lütfen daha sonra tekrar deneyin." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("store_settings")
    .update({ currency_exchange_rate: rate, currency_updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) {
    return { error: `Kur güncellenemedi: ${error.message}` };
  }

  revalidatePath("/admin/sistem/yerel");
  return {};
}

export async function updateStoreProductListing(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const productsPerPage = Number(formData.get("productsPerPage"));
  const showCategoryProductCount = formData.get("showCategoryProductCount") === "on";
  const allowReviews = formData.get("allowReviews") === "on";
  const allowGuestReviews = formData.get("allowGuestReviews") === "on";

  if (!Number.isFinite(productsPerPage) || productsPerPage < 1) {
    return { error: "Sayfa başına ürün sayısı geçerli bir sayı olmalı." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("store_settings")
    .update({
      products_per_page: productsPerPage,
      show_category_product_count: showCategoryProductCount,
      allow_reviews: allowReviews,
      allow_guest_reviews: allowGuestReviews,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  revalidatePath("/", "layout");
  revalidatePath("/magaza");
  revalidatePath("/admin/sistem/urunler");
  return {};
}

export async function updateXmlFeedEnabled(enabled: boolean) {
  const supabase = await createClient();
  await supabase.from("store_settings").update({ xml_feed_enabled: enabled }).eq("id", 1);
  revalidatePath("/admin/eklentiler/veri-akisi");
}

export async function updateGiftCardsEnabled(enabled: boolean) {
  const supabase = await createClient();
  await supabase.from("store_settings").update({ gift_cards_enabled: enabled }).eq("id", 1);
  revalidatePath("/admin/sistem/hediye-ceki");
}

export async function uploadFavicon(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const faviconUrl = await uploadSingleImage(formData, "favicon", "favicon");

  if (!faviconUrl) {
    return { error: "Lütfen bir görsel seçin." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("store_settings")
    .update({ favicon_url: faviconUrl, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/sistem/resimler");
  return {};
}

export async function updateEmailSettings(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const smtpHost = String(formData.get("smtpHost") ?? "").trim();
  const smtpUsername = String(formData.get("smtpUsername") ?? "").trim();
  const smtpPasswordRaw = String(formData.get("smtpPassword") ?? "");
  const smtpPortRaw = String(formData.get("smtpPort") ?? "").trim();
  const smtpTimeoutRaw = String(formData.get("smtpTimeout") ?? "30").trim();

  const supabase = await createClient();

  const update: Record<string, unknown> = {
    smtp_host: smtpHost || null,
    smtp_username: smtpUsername || null,
    smtp_port: smtpPortRaw ? Number(smtpPortRaw) : null,
    smtp_timeout: smtpTimeoutRaw ? Number(smtpTimeoutRaw) : 30,
    updated_at: new Date().toISOString(),
  };
  // Şifre alanı boş bırakılırsa mevcut kayıtlı şifre korunur (ekranda tekrar gösterilmez).
  if (smtpPasswordRaw) {
    update.smtp_password = smtpPasswordRaw;
  }

  const { error } = await supabase.from("notification_settings").update(update).eq("id", 1);

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  revalidatePath("/admin/sistem/eposta");
  return {};
}

export async function updateAlertSettings(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const alertNewCustomer = formData.get("alertNewCustomer") === "on";
  const alertNewOrder = formData.get("alertNewOrder") === "on";
  const alertNewReview = formData.get("alertNewReview") === "on";
  const alertExtraEmail = String(formData.get("alertExtraEmail") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("notification_settings")
    .update({
      alert_new_customer: alertNewCustomer,
      alert_new_order: alertNewOrder,
      alert_new_review: alertNewReview,
      alert_extra_email: alertExtraEmail || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  revalidatePath("/admin/sistem/uyarilar");
  return {};
}

export async function updateServerSettings(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const maintenanceMode = formData.get("maintenanceMode") === "on";
  const seoUrlEnabled = formData.get("seoUrlEnabled") === "on";
  const sslEnabled = formData.get("sslEnabled") === "on";

  const supabase = await createClient();
  const { error } = await supabase
    .from("store_settings")
    .update({
      maintenance_mode: maintenanceMode,
      seo_url_enabled: seoUrlEnabled,
      ssl_enabled: sslEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/sistem/sunucu");
  return {};
}
