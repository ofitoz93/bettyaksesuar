import Image from "next/image";
import Link from "next/link";
import { getLowStockProducts, LOW_STOCK_THRESHOLD } from "@/lib/data/products";
import { formatPrice } from "@/lib/orders";
import StockInput from "./StockInput";

export default async function StokAzalanPage() {
  const products = await getLowStockProducts();
  const outOfStock = products.filter((p) => (p.stock ?? 0) <= 0).length;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h1 className="font-display text-[28px]">Azalan Stok</h1>
        <span className="text-xs text-ink-soft">{products.length} ürün</span>
      </div>
      <p className="mb-6 text-sm text-ink-soft">
        Stoğu {LOW_STOCK_THRESHOLD} adet ve altına düşen ürünler, en az kalandan başlayarak.
        {outOfStock > 0 && (
          <>
            {" "}
            <strong className="text-status-red-fg">{outOfStock} ürün tükendi</strong> ve mağazada
            satın alınamıyor.
          </>
        )}{" "}
        Stoğu buradan güncelleyebilirsiniz; tükenen bir ürün stoğa girince &ldquo;haber ver&rdquo;
        diyen müşterilere e-posta gider.
      </p>

      {products.length === 0 ? (
        <div className="border border-dashed border-line bg-white px-6 py-12 text-center text-sm text-ink-soft">
          Stoğu azalan ürün yok. 🎉
        </div>
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {products.map((product) => {
            const stock = product.stock ?? 0;
            return (
              <li key={product.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
                <Link
                  href={`/admin/urun/${product.id}`}
                  className="flex min-w-0 flex-1 basis-56 items-center gap-3"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-linear-to-br from-[#EDE3D2] to-[#D9C7A6]">
                    {product.images?.[0] && (
                      <Image src={product.images[0]} alt="" fill sizes="48px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm hover:text-gold-deep">{product.name}</div>
                    <div className="text-xs text-ink-faint">
                      {formatPrice(product.price)}
                      {!product.isActive && " · Pasif"}
                    </div>
                  </div>
                </Link>
                <span
                  className={`shrink-0 px-2 py-0.5 text-[11px] ${
                    stock <= 0
                      ? "bg-status-red-bg text-status-red-fg"
                      : "bg-status-amber-bg text-status-amber-fg"
                  }`}
                >
                  {stock <= 0 ? "Tükendi" : `${stock} adet kaldı`}
                </span>
                <StockInput productId={product.id} stock={stock} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
