"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { notifyBackInStockCustomers } from "@/lib/data/stockNotifications";
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
  const description = String(formData.get("description") ?? "").trim();
  const isNew = formData.get("isNew") === "on";
  const isBestSeller = formData.get("isBestSeller") === "on";

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
    description: description || null,
    isNew,
    isBestSeller,
  };
}

async function uploadImages(formData: FormData, slug: string): Promise<string[]> {
  const supabase = await createClient();
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

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
      description: fields.description,
      is_new: fields.isNew,
      is_best_seller: fields.isBestSeller,
    })
    .select("id")
    .single();

  if (error || !product) {
    return { error: `Ürün eklenemedi: ${error?.message ?? "bilinmeyen hata"}` };
  }

  const imageUrls = await uploadImages(formData, fields.slug);
  if (imageUrls.length > 0) {
    await supabase.from("product_images").insert(
      imageUrls.map((url, index) => ({
        product_id: product.id,
        url,
        position: index,
      })),
    );
  }

  revalidatePath("/admin");
  revalidatePath("/magaza");
  revalidatePath("/");
  redirect("/admin");
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
      description: fields.description,
      is_new: fields.isNew,
      is_best_seller: fields.isBestSeller,
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

  revalidatePath("/admin");
  revalidatePath("/magaza");
  revalidatePath("/");
  redirect("/admin");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/magaza");
  revalidatePath("/");
}

export async function updateShippingSettings(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const freeShippingThreshold = Number(formData.get("freeShippingThreshold"));
  const standardShippingFee = Number(formData.get("standardShippingFee"));

  if (!Number.isFinite(freeShippingThreshold) || !Number.isFinite(standardShippingFee)) {
    return { error: "Lütfen geçerli sayılar girin." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("shipping_settings")
    .update({
      free_shipping_threshold: freeShippingThreshold,
      standard_shipping_fee: standardShippingFee,
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
  const engravingEyebrow = String(formData.get("engravingEyebrow") ?? "").trim();
  const engravingHeading = String(formData.get("engravingHeading") ?? "").trim();
  const engravingBody = String(formData.get("engravingBody") ?? "").trim();
  const engravingButtonLabel = String(formData.get("engravingButtonLabel") ?? "").trim();

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
      engraving_eyebrow: engravingEyebrow,
      engraving_heading: engravingHeading,
      engraving_body: engravingBody,
      engraving_button_label: engravingButtonLabel,
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

export async function updateCategoryImage(
  category: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const imageUrl = await uploadSingleImage(formData, "image", `category-${category}`);

  if (!imageUrl) {
    return { error: "Lütfen bir görsel seçin." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("category_images")
    .upsert({ category, image_url: imageUrl, updated_at: new Date().toISOString() });

  if (error) {
    return { error: `Kaydedilemedi: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/magaza");
  revalidatePath("/admin/ayarlar/kategoriler");
  return {};
}

export async function removeCategoryImage(category: string) {
  const supabase = await createClient();
  await supabase.from("category_images").delete().eq("category", category);

  revalidatePath("/");
  revalidatePath("/magaza");
  revalidatePath("/admin/ayarlar/kategoriler");
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
