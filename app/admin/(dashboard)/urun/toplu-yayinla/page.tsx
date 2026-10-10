import { getCategories } from "@/lib/data/categories";
import BulkPublishForm from "./BulkPublishForm";

export default async function TopluUrunYayinlaPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="font-display mb-2 text-[28px]">Toplu Ürün Ekle</h1>
      <p className="mb-8 max-w-3xl text-sm text-ink-soft">
        Birden fazla ürünü tek seferde ekleyin. Her ürün için bilgileri doldurun, alttaki{" "}
        <strong>Yeni Ürün Ekle</strong> ile bir sonrakine geçin ve en altta{" "}
        <strong>Kaydet ve Yayınla</strong>ya basın. Ürünler doğrudan mağazada yayına alınır.
      </p>
      <BulkPublishForm categories={categories} />
    </div>
  );
}
