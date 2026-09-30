// Kategoriler artık "categories" tablosunda admin tarafından yönetiliyor
// (bkz. lib/data/categories.ts) — sabit bir union yerine serbest metin (slug).
export type ProductCategory = string;

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number | null;
  discountPercent?: number | null;
  isNew?: boolean;
  isBestSeller?: boolean;
  description?: string | null;
  images?: string[];
  stock?: number;
  costPrice?: number | null;
  sku?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  taxClassPercent?: number;
  isActive?: boolean;
}

export interface Testimonial {
  id: string;
  author: string;
  rating: number;
  quote: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
}

export type PaymentMethod = "kapida_odeme" | "havale" | "kredi_karti";
