import { createProduct } from "@/app/admin/actions";
import ProductForm from "../../ProductForm";

export default function YeniUrunPage() {
  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Yeni Ürün</h1>
      <ProductForm action={createProduct} submitLabel="Ürünü Ekle" />
    </div>
  );
}
