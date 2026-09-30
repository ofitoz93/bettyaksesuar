import BulkProductForm from "./BulkProductForm";

export default function TopluUrunEklePage() {
  return (
    <div>
      <h1 className="font-display mb-2 text-[28px]">Toplu Ürün Ekle</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Toptancıdan aldığınız ürünleri hızlıca kaydedin — sadece ürün adı, ürün kodu/barkod
        (kamerayla tarayın ya da elle girin) ve fotoğraflar (bilgisayardan seçin ya da telefonda
        kameradan çekin) yeterli. Buradaki ürünler doğrudan mağazaya düşmez;{" "}
        <strong>Toptancı Havuzu</strong> sayfasına eklenir ve oradan inceleyip görsellerini
        indirebilirsiniz.
      </p>
      <BulkProductForm />
    </div>
  );
}
