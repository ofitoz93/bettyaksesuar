import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug } from "@/lib/data/categories";
import { updateCategory } from "@/app/admin/actions";
import CategoryForm from "../CategoryForm";

interface EditKategoriPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditKategoriPage({ params }: EditKategoriPageProps) {
  const { slug } = await params;
  const [category, categories] = await Promise.all([getCategoryBySlug(slug), getCategories()]);

  if (!category) {
    notFound();
  }

  const updateWithSlug = updateCategory.bind(null, slug);

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Kategoriyi Düzenle</h1>
      <CategoryForm
        action={updateWithSlug}
        category={category}
        otherCategories={categories}
        submitLabel="Değişiklikleri Kaydet"
      />
    </div>
  );
}
