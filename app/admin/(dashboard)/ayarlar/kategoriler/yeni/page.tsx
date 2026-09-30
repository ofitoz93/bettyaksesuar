import { getCategories } from "@/lib/data/categories";
import { createCategory } from "@/app/admin/actions";
import CategoryForm from "../CategoryForm";

export default async function YeniKategoriPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Yeni Kategori</h1>
      <CategoryForm action={createCategory} otherCategories={categories} submitLabel="Kaydet" />
    </div>
  );
}
