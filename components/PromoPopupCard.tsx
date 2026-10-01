import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ui/ProductCard";

export interface PromoPopupCardSettings {
  title: string;
  body: string;
  imageUrl: string | null;
  buttonLabel: string;
  discountCode: string;
}

export default function PromoPopupCard({
  settings,
  products = [],
  interactive = true,
  copied = false,
  onCodeClick,
}: {
  settings: PromoPopupCardSettings;
  products?: Product[];
  interactive?: boolean;
  copied?: boolean;
  onCodeClick?: () => void;
}) {
  return (
    <div className="relative grid w-full max-w-3xl grid-cols-1 overflow-hidden rounded-lg bg-white shadow-xl md:grid-cols-[240px_1fr_240px]">
      {settings.imageUrl ? (
        <div className="relative h-36 md:h-auto">
          <Image src={settings.imageUrl} alt="" fill sizes="240px" className="object-cover" />
        </div>
      ) : (
        <div className="hidden bg-ivory-deep md:block" />
      )}

      <div className="flex flex-col justify-center p-6 text-center md:border-x md:border-line md:text-left">
        <h2 className="font-display mb-1.5 text-lg">{settings.title}</h2>
        <p className="mb-4 text-xs leading-relaxed text-ink-soft">{settings.body}</p>

        {onCodeClick ? (
          <button
            type="button"
            onClick={onCodeClick}
            className="w-full border border-dashed border-ink px-4 py-2.5 text-xs tracking-[0.1em] uppercase hover:bg-ivory-deep"
          >
            {copied ? "Kopyalandı ✓" : `${settings.discountCode} — ${settings.buttonLabel}`}
          </button>
        ) : (
          <div className="w-full border border-dashed border-ink px-4 py-2.5 text-xs tracking-[0.1em] uppercase">
            {settings.discountCode} — {settings.buttonLabel}
          </div>
        )}

        {interactive ? (
          <Link
            href={`/hesabim/kayit?code=${encodeURIComponent(settings.discountCode)}`}
            className="mt-3 block bg-ink px-4 py-2.5 text-center text-[11px] font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep"
          >
            Üye Ol, Kodu Kullan
          </Link>
        ) : (
          <div className="mt-3 bg-ink px-4 py-2.5 text-center text-[11px] font-medium tracking-[0.14em] text-ivory uppercase">
            Üye Ol, Kodu Kullan
          </div>
        )}
        <div className="mt-2.5 text-center text-[11px] text-ink-soft underline">
          Zaten üye misiniz? Giriş yapın
        </div>
      </div>

      {products.length > 0 && (
        <div className="border-t border-line p-5 md:border-t-0">
          <h3 className="font-display mb-3 text-xs">Beğenebileceğiniz Ürünler</h3>
          <div className="grid grid-cols-3 gap-2.5 md:grid-cols-2">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
