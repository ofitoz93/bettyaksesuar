import { createProduct } from "@/app/admin/actions";
import { getCategories } from "@/lib/data/categories";
import ProductForm from "../../ProductForm";

export default async function YeniUrunPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Yeni Ürün</h1>
      <ProductForm action={createProduct} categories={categories} submitLabel="Ürünü Ekle" />
    </div>
  );
}
