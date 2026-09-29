export type ProductCategory =
  | "kolye"
  | "boncuk-kolye"
  | "kupe"
  | "bileklik"
  | "kelepce"
  | "yuzuk"
  | "set"
  | "saat"
  | "sahmeran"
  | "halhal";

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

export type PaymentMethod = "kapida_odeme" | "havale";
