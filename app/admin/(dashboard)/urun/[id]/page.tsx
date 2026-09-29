import { notFound } from "next/navigation";
import { getProductById, getProductImages } from "@/lib/data/products";
import { updateProduct } from "@/app/admin/actions";
import ProductForm from "../../ProductForm";

interface EditUrunPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUrunPage({ params }: EditUrunPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const existingImages = await getProductImages(id);
  const updateWithId = updateProduct.bind(null, id);

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Ürünü Düzenle</h1>
      <ProductForm
        action={updateWithId}
        product={product}
        existingImages={existingImages}
        submitLabel="Değişiklikleri Kaydet"
      />
    </div>
  );
}
