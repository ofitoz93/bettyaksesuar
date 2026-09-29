import BulkProductForm from "./BulkProductForm";

export default function TopluUrunEklePage() {
  return (
    <div>
      <h1 className="font-display mb-2 text-[28px]">Toplu Ürün Ekle</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Toptancıdan aldığınız ürünleri tek seferde girin — kod/barkod, alış fiyatı ve fotoğrafları
        (bilgisayardan seçin ya da telefonda kameradan çekin) ekleyip hepsini birden kaydedin.
      </p>
      <BulkProductForm />
    </div>
  );
}
